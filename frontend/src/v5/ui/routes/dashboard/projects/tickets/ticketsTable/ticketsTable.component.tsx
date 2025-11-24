/**
 *  Copyright (C) 2023 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { ContainersActionsDispatchers, FederationsActionsDispatchers, JobsActionsDispatchers, ProjectsActionsDispatchers, TicketsActionsDispatchers, TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ContainersHooksSelectors, FederationsHooksSelectors, ProjectsHooksSelectors, TicketsHooksSelectors, UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams, generatePath, useNavigate } from 'react-router-dom';
import ExpandIcon from '@assets/icons/outlined/expand_panel-outlined.svg';
import AddCircleIcon from '@assets/icons/filled/add_circle-filled.svg';
import { CircleButton } from '@controls/circleButton';
import { SelectChangeEvent } from '@mui/material';
import { combineSubscriptions } from '@/v5/services/realtime/realtime.service';
import { enableRealtimeNewTicket, enableRealtimeUpdateTicket } from '@/v5/services/realtime/ticket.events';
import { TicketContextComponent } from '@/v5/ui/routes/viewer/tickets/ticket.context';
import { isCommenterRole } from '@/v5/store/store.helpers';
import { TicketsTableContent } from './ticketsTableContent/ticketsTableContent.component';
import { Transformers, useSearchParam } from '../../../../useSearchParam';
import { DashboardTicketsParams, TICKETS_ROUTE, TICKETS_ROUTE_WITH_TICKET, VIEWER_ROUTE } from '../../../../routes.constants';
import { ContainersAndFederationsSelect } from '../selectMenus/containersAndFederationsFormSelect.component';
import { GroupBySelect } from '../selectMenus/groupBySelect.component';
import { TemplateSelect } from '../selectMenus/templateFormSelect.component';
import { Link, FiltersContainer, NewTicketButton, SelectorsContainer, SidePanel, SlidePanelHeader, OpenInViewerButton, FlexContainer, TicketsTableLayout } from '../tickets.styles';
import { INITIAL_COLUMNS_NO_OVERRIDES, NEW_TICKET_ID, PresetValue, SetTicketValue } from './ticketsTable.helper';
import { NewTicketMenu } from './newTicketMenu/newTicketMenu.component';
import { NewTicketSlide } from '../ticketsList/slides/newTicketSlide.component';
import { TicketSlide } from '../ticketsList/slides/ticketSlide.component';
import { useSelectedModels } from './newTicketMenu/useSelectedModels';
import { ResizableTableContext, ResizableTableContextComponent } from '@controls/resizableTableContext/resizableTableContext';
import { templateAlreadyFetched } from '@/v5/store/tickets/tickets.helpers';
import { TicketsTableContext, TicketsTableContextComponent } from './ticketsTableContext/ticketsTableContext';
import { useContextWithCondition } from '@/v5/helpers/contextWithCondition/contextWithCondition.hooks';
import { selectTicketsHaveBeenFetched } from '@/v5/store/tickets/tickets.selectors';
import { getState } from '@/v5/helpers/redux.helpers';
import { useWatchPropertyChange } from './useWatchPropertyChange';
import { getAvailableColumnsForTemplate } from './ticketsTableContext/ticketsTableContext.helpers';
import { TicketsFiltersContextComponent } from '@components/viewer/cards/cardFilters/ticketsFilters.context';
import { apiFetchFilteredTickets } from '@/v5/store/tickets/card/ticketsCard.sagas';
import { TicketFilter } from '@components/viewer/cards/cardFilters/cardFilters.types';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { FilterSelection } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFiltersSelection.component';
import { CardFilters } from '@components/viewer/cards/cardFilters/cardFilters.component';
import { deserializeFilter, getNonCompletedTicketFilters, getTemplateFilter, serializeFilter } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFilters.helpers';
import { useRealtimeFiltering } from './useRealtimeFiltering';
import { isEqual } from 'lodash';
import { BulkEditButton } from './bulkEditButton.component';

const paramToInputProps = (value, setter) => ({
	value,
	onChange: (ev: SelectChangeEvent<unknown>) => setter((ev.target as HTMLInputElement).value),
});

type TicketsTableProps = {
	isNewTicketDirty: boolean,
	setTicketValue: SetTicketValue,
};

export const TicketsTable = ({ isNewTicketDirty, setTicketValue }: TicketsTableProps) => {
	const navigate = useNavigate();
	const params = useParams<DashboardTicketsParams>();
	const { setSelectedIds, selectedIds } = useContext(TicketsTableContext);
	const [refreshTableFlag, setRefreshTableFlag] = useState(false);
	const { teamspace, project, template, ticketId } = params;
	const { groupBy, fetchColumn } = useContext(TicketsTableContext);
	const { visibleSortedColumnsNames } = useContextWithCondition(ResizableTableContext, ['visibleSortedColumnsNames']);

	const paramsToSave = useRef({ search: window.location.search, params });
	
	const [containersAndFederations, setContainersAndFederations] = useSearchParam('models', Transformers.STRING_ARRAY, true);
	const [containerOrFederation] = useSearchParam('containerOrFederation');
	const [filteredTickets, setFilteredTickets] = useState<ITicket[]>([]);
	const models = useSelectedModels();
	// These are the modelIds which are validated
	const modelsIds = models.map(({ _id }) => _id);
	const [filters, setFilters] = useState<TicketFilter[]>();
	const [isFiltering, setIsFiltering] = useState<boolean>(true);
	const [filteredTicketsIDs, setFilteredTicketIds] = useState<Set<string>>(new Set());
	
	const riskCategories = TicketsHooksSelectors.selectRiskCategories();
	const users = UsersHooksSelectors.selectCurrentTeamspaceUsers();
	const setTemplate = useCallback((newTemplate) => {
		const newParams = { ...params, template: newTemplate } as Required<DashboardTicketsParams>;
		const ticketsPath = TICKETS_ROUTE;
		const path = generatePath(ticketsPath, newParams);
		const search = 'models=' + encodeURIComponent(Transformers.STRING_ARRAY.to(containersAndFederations));
		navigate({ pathname: path, search }, { replace: false });
	}, [params, navigate, containersAndFederations]);

	useEffect(() => {
		TicketsCardActionsDispatchers.setSelectedTicket(ticketId);
	}, [ticketId]);

	const tickets:ITicket[] = TicketsHooksSelectors.selectTicketsByContainersAndFederations(containersAndFederations);
	const templates = ProjectsHooksSelectors.selectCurrentProjectTemplates();
	const selectedTemplate = ProjectsHooksSelectors.selectCurrentProjectTemplateById(template);
	const isFed = FederationsHooksSelectors.selectIsFederation();
	const ticketsByModelId = TicketsHooksSelectors.selectTicketsByModelIdDictionary();
	const prevModelIdsRef = useRef<string[]>(containersAndFederations);

	const [paramFilters, setParamFilters] = useSearchParam<string>('filters', undefined, true);

	const readOnly = isFed(containerOrFederation)
		? !FederationsHooksSelectors.selectHasCommenterAccess(containerOrFederation)
		: !ContainersHooksSelectors.selectHasCommenterAccess(containerOrFederation);


	const newTicketButtonIsDisabled = useMemo(() =>
		!containersAndFederations.length || models.filter(({ role }) => isCommenterRole(role)).length === 0,
	[models, containerOrFederation]);

	useEffect(() => {
		if (!models.length) return;
		
		modelsIds.forEach((modelId) => {
			if (selectTicketsHaveBeenFetched(getState(), modelId)) return;
			const isFederation = isFed(modelId);
			TicketsActionsDispatchers.fetchTickets(teamspace, project, modelId, isFederation);
			if (isFederation) {
				FederationsActionsDispatchers.fetchFederationUsers(teamspace, project, modelId);
				FederationsActionsDispatchers.fetchFederationJobs(teamspace, project, modelId);
			} else {
				ContainersActionsDispatchers.fetchContainerUsers(teamspace, project, modelId);
				ContainersActionsDispatchers.fetchContainerJobs(teamspace, project, modelId);
			}
		});
		const subscriptions = modelsIds.flatMap((modelId) => {
			return [
				enableRealtimeNewTicket(teamspace, project, modelId, isFed(modelId)),
				enableRealtimeUpdateTicket(teamspace, project, modelId, isFed(modelId)),
			];
		});
		return combineSubscriptions(...subscriptions);
	}, [models]);

	useEffect(() => {
		JobsActionsDispatchers.fetchJobs(teamspace);
		TicketsActionsDispatchers.fetchRiskCategories(teamspace);
	}, []);

	useEffect(() => {
		TicketsCardActionsDispatchers.setReadOnly(readOnly);
	}, [readOnly]);

	useEffect(() => {
		if (templates.length) return;
		ProjectsActionsDispatchers.fetchTemplates(teamspace, project);
	}, []);

	useEffect(() => {
		if (!templateAlreadyFetched(selectedTemplate)) {
			ProjectsActionsDispatchers.fetchTemplate(teamspace, project, template);
		}
	}, [template]);

	useEffect(() => {
		visibleSortedColumnsNames
			.filter((name) => !INITIAL_COLUMNS_NO_OVERRIDES.includes(name))
			.forEach((name) => fetchColumn(name, filteredTickets));
	}, [filteredTickets.map(({ _id }) => _id).join(), visibleSortedColumnsNames.join()]);

	useEffect(() => {
		setIsFiltering(true);

		if (!filters) return;
		let mounted = true;
		(async () => {
			const templateFilter = getTemplateFilter(selectedTemplate.code);
			const allFilters = [...filters, templateFilter];

			const idsSets:Set<string>[] =  await Promise.all(modelsIds.map(
				(id) => apiFetchFilteredTickets(teamspace, project, id, isFed(id), allFilters)),
			);

			if (!mounted) return;
			const idsSet = new Set<string>();
			idsSets.forEach((idSetPerContainer) => {
				for (let id of idSetPerContainer) {
					idsSet.add(id);
				}
			});

			setFilteredTicketIds(idsSet);
			setIsFiltering(false);
		})();

		return () => { mounted = false;};
	}, [models,  selectedTemplate?.code, JSON.stringify(filters)]);

	useEffect(() => {
		const filtTickets = tickets.filter(({ _id }) => filteredTicketsIDs.has(_id));
		setFilteredTickets(filtTickets);
	}, [tickets, filteredTicketsIDs]);

	useWatchPropertyChange(groupBy, () => setRefreshTableFlag(!refreshTableFlag));

	useRealtimeFiltering(teamspace, project, containersAndFederations, selectedTemplate, filters || [], 
		(updatedTicketId, included) => {
			// if nothing changed do nothing;
			if (filteredTicketsIDs.has(updatedTicketId) === included) return;
			const newFilteredIds = new Set(filteredTicketsIDs);
			if (included) newFilteredIds.add(updatedTicketId);
			else newFilteredIds.delete(updatedTicketId);
			setFilteredTicketIds(newFilteredIds);
		});

	/**
	 * This part react to the filters in the url being changed and
	 * set the actual filters.
	 * If there is no filters in the url it sets the default filters
	 */
	useEffect(() => { 
		if (!templateAlreadyFetched(selectedTemplate)) return;
		
		if (!paramFilters) {
			const newFilters  = getNonCompletedTicketFilters([selectedTemplate], containerOrFederation[0]);
			if (isEqual(newFilters, filters)) return;
			setFilters(newFilters);
			return;
		}
	
	 	if (!riskCategories.length || !users.length) return;
		
		try {
		// Dont blank the page if the url param has the wrong format
			const newFilters = JSON.parse(paramFilters).map((f) => {
				try {
					return deserializeFilter(selectedTemplate, users, riskCategories, f);
				} catch (e) {
					console.error('Error parsing the url filter param');
					console.error(e);
					return undefined;
				}
			}).filter(Boolean);
			if (isEqual(newFilters, filters)) return;
			setFilters(newFilters);
		} catch (e) {
			console.error('Error parsing the url filter param');
			console.error(e);
			return undefined;
		}
	}, [selectedTemplate, paramFilters, filters, users]);
	
	/**
	 * When the filter objects are changed this bit changes
	 * the url search param.
	 */
	const onChangeFilters = (newFilters) => {
		if (!newFilters && !paramFilters) return;
		if (!templateAlreadyFetched(selectedTemplate)) return;

		const defaultFilters = getNonCompletedTicketFilters([selectedTemplate], containerOrFederation[0]);

		let param = JSON.stringify(newFilters.map((f) => 
			serializeFilter(selectedTemplate, riskCategories, f),
		));

		// When there are no paramFilters that means the defaultfilters are there so no need to update the url
		if (isEqual(defaultFilters, newFilters) && !paramFilters) return;
		if (paramFilters === param) return;
		setParamFilters(param);
	};

	useEffect(() => {
		return () => {
			TicketsActionsDispatchers.setTabularViewParams(paramsToSave.current.params, paramsToSave.current.search);
		};
	}, []);
	
	useEffect(() => {
		// Must remove selected ticket ids if their corresponding model is removed from the table
		const prevModelIds = prevModelIdsRef.current;
		const removedModelIds = prevModelIds.filter((id) => !containersAndFederations.includes(id));
		if (removedModelIds.length > 0) {
			const ticketIdsToRemove = removedModelIds.flatMap((id) => ticketsByModelId[id])
			setSelectedIds(selectedIds.filter((id) => !ticketIdsToRemove.includes(id)))
		}
		prevModelIdsRef.current = containersAndFederations;
	}, [containersAndFederations]);

	paramsToSave.current = { search: window.location.search, params };

	// If the template id in the url is wrong default to the first template
	if (!selectedTemplate) {
		setTemplate(templates[0]._id);
		return null;
	}

	return (
		// eslint-disable-next-line max-len
		<TicketsFiltersContextComponent onChange={onChangeFilters} templates={[selectedTemplate]} modelsIds={containersAndFederations} filters={filters} isFiltering={isFiltering}>
			<TicketsTableLayout>
				<FiltersContainer>
					<FlexContainer>
						<SelectorsContainer>
							<ContainersAndFederationsSelect
								isNewTicketDirty={isNewTicketDirty}
								{...paramToInputProps(containersAndFederations, setContainersAndFederations)}
							/>
							<TemplateSelect
								isNewTicketDirty={isNewTicketDirty}
								{...paramToInputProps(template, setTemplate)}
							/>
							<GroupBySelect />
							<BulkEditButton />
						</SelectorsContainer>
					</FlexContainer>
					<FlexContainer>
						<FilterSelection />
						{!selectedTemplate.deprecated
							&&
							<NewTicketMenu
								TriggerButton={(
									<NewTicketButton
										startIcon={<AddCircleIcon />}
										disabled={newTicketButtonIsDisabled}
									>
										<FormattedMessage id="ticketsTable.button.newTicket" defaultMessage="New Ticket" />
									</NewTicketButton>
								)}
								disabled={newTicketButtonIsDisabled}
								onContainerOrFederationClick={setTicketValue}
							/>}
					</FlexContainer>
				</FiltersContainer>
				<CardFilters />
				<TicketsTableContent tickets={filteredTickets} setTicketValue={setTicketValue} selectedTicketId={ticketId} />
			</TicketsTableLayout>
		</TicketsFiltersContextComponent>
	);
};

const TabularViewTicketForm = ({ setIsNewTicketDirty, setTicketValue, presetValue }) => {
	const [containerOrFederation] = useSearchParam('containerOrFederation');
	const params = useParams<DashboardTicketsParams>();
	const { ticketId, teamspace, project, template } = params;
	const models = useSelectedModels();

	const isNewTicket = (ticketId || '').toLowerCase() === NEW_TICKET_ID;

	const getOpenInViewerLink = () => {
		if (!containerOrFederation) return '';

		const pathname = generatePath(VIEWER_ROUTE, {
			teamspace,
			project,
			containerOrFederation: containerOrFederation || '',
		});
		return pathname + (ticketId ? `?ticketId=${ticketId}` : '');
	};

	const clearTicketId = () => setTicketValue();

	const onSaveTicket = (_id: string) => setTicketValue(containerOrFederation, _id, null, true);
	const selectedTemplate = ProjectsHooksSelectors.selectCurrentProjectTemplateById(template);
	const haveValidContainerOrFederation = models.some(({ _id }) => _id === containerOrFederation);


	return (
		<SidePanel open={!!ticketId && haveValidContainerOrFederation}>
			<SlidePanelHeader>
				<Link to={getOpenInViewerLink()} target="_blank" disabled={isNewTicket}>
					<OpenInViewerButton disabled={isNewTicket}>
						<FormattedMessage
							id="ticketsTable.button.openIn3DViewer"
							defaultMessage="Open in 3D viewer"
						/>
					</OpenInViewerButton>
				</Link>
				<CircleButton onClick={clearTicketId}>
					<ExpandIcon />
				</CircleButton>
			</SlidePanelHeader>
			<TicketContextComponent isViewer={false} containerOrFederation={containerOrFederation}>
				{!isNewTicket && (<TicketSlide ticketId={ticketId} template={selectedTemplate} clearTicketId={clearTicketId} />)}
				{isNewTicket && (
					<NewTicketSlide
						presetValue={presetValue}
						template={selectedTemplate}
						containerOrFederation={containerOrFederation}
						onSave={onSaveTicket}
						onDirtyStateChange={setIsNewTicketDirty}
					/>
				)}
			</TicketContextComponent>
		</SidePanel>
	);
};

export const TabularView = () => {
	const { template: templateId } = useParams<DashboardTicketsParams>();
	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(templateId);
	const templateHasBeenFetched = templateAlreadyFetched(template);
	const columns = templateHasBeenFetched ? getAvailableColumnsForTemplate(template) : [];
	const [isNewTicketDirty, setIsNewTicketDirty] = useState(false);
	const params = useParams<DashboardTicketsParams>();
	const navigate = useNavigate();

	const [,,setContainerOrFederation] = useSearchParam('containerOrFederation');

	const [presetValue, setPresetValue] = useState<PresetValue>();

	const setTicketValue = useCallback((modelId?: string, ticket_id?: string, presValue?: PresetValue, replace: boolean = false) => {
		const id = (modelId && !ticket_id) ? NEW_TICKET_ID : ticket_id;
		const newParams = { ...params, ticketId: id || '' } as Required<DashboardTicketsParams>;
		const search = setContainerOrFederation(modelId);
		setPresetValue(presValue);
		const path = generatePath(TICKETS_ROUTE_WITH_TICKET, newParams);

		navigate({ pathname: path, search }, { replace });
	}, [params, navigate, setContainerOrFederation]);

	return (
		<TicketsTableContextComponent>
			<ResizableTableContextComponent columns={columns} columnGap={1}>
				<TicketsTable isNewTicketDirty={isNewTicketDirty} setTicketValue={setTicketValue} />
			</ResizableTableContextComponent>
			<TabularViewTicketForm setIsNewTicketDirty={setIsNewTicketDirty} setTicketValue={setTicketValue} presetValue={presetValue}/>
		</TicketsTableContextComponent>
	);
};
