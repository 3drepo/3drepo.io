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
import { ContainersHooksSelectors, FederationsHooksSelectors, ProjectsHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
import { INITIAL_COLUMNS, NEW_TICKET_ID, PresetValue, SetTicketValue } from './ticketsTable.helper';
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
import { getNonCompletedTicketFilters } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFilters.helpers';

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
	const [refreshTableFlag, setRefreshTableFlag] = useState(false);

	const { teamspace, project, template, ticketId } = params;
	const { groupBy, fetchColumn } = useContext(TicketsTableContext);
	const { visibleSortedColumnsNames } = useContextWithCondition(ResizableTableContext, ['visibleSortedColumnsNames']);

	const [containersAndFederations, setContainersAndFederations] = useSearchParam('models', Transformers.STRING_ARRAY, true);
	const [containerOrFederation] = useSearchParam('containerOrFederation');
	const [filteredTickets, setFilteredTickets] = useState<ITicket[]>([]);
	const models = useSelectedModels();
	const [filters, setFilters] = useState<TicketFilter[]>();
	const [filteredTicketsIDs, setFilteredTicketIds] = useState<Set<string>>(new Set());


	const setTemplate = useCallback((newTemplate) => {
		setTicketValue();
		const newParams = { ...params, template: newTemplate } as Required<DashboardTicketsParams>;
		const ticketsPath = ticketId ? TICKETS_ROUTE_WITH_TICKET : TICKETS_ROUTE;
		const path = generatePath(ticketsPath, newParams);
		navigate({ pathname: path, search: window.location.search }, { replace: false });
	}, [params, navigate]);

	useEffect(() => {
		TicketsCardActionsDispatchers.setSelectedTicket(ticketId);
	}, [ticketId]);

	const tickets:ITicket[] = TicketsHooksSelectors.selectTicketsByContainersAndFederations(containersAndFederations);
	const templates = ProjectsHooksSelectors.selectCurrentProjectTemplates();
	const selectedTemplate = ProjectsHooksSelectors.selectCurrentProjectTemplateById(template);
	const isFed = FederationsHooksSelectors.selectIsFederation();

	const readOnly = isFed(containerOrFederation)
		? !FederationsHooksSelectors.selectHasCommenterAccess(containerOrFederation)
		: !ContainersHooksSelectors.selectHasCommenterAccess(containerOrFederation);


	const newTicketButtonIsDisabled = useMemo(() =>
		!containersAndFederations.length || models.filter(({ role }) => isCommenterRole(role)).length === 0,
	[models, containerOrFederation]);

	useEffect(() => {
		if (!models.length) return;

		containersAndFederations.forEach((modelId) => {
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

		const subscriptions = containersAndFederations.flatMap((modelId) => {
			return [
				enableRealtimeNewTicket(teamspace, project, modelId, isFed(modelId)),
				enableRealtimeUpdateTicket(teamspace, project, modelId, isFed(modelId)),
			];
		});
		return combineSubscriptions(...subscriptions);
	}, [!models.length, containersAndFederations]);

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
			.filter((name) => !INITIAL_COLUMNS.includes(name))
			.forEach((name) => fetchColumn(name, filteredTickets));
	}, [filteredTickets.length, visibleSortedColumnsNames.join('')]);



	
	const [presetFilters, setPresetFilters] = useState<TicketFilter[]>(); 
	useEffect(() => {
		if (!filters) return;
		let mounted = true;
		(async () => {
			const templateFilter:TicketFilter = {
				type:'template',
				property:'',
				filter: { operator:'is', 
					values:[selectedTemplate.code],
				}, 
			};
	
			const allFilters = [...filters, templateFilter];
	
			const idsSets:Set<string>[] =  await Promise.all(containersAndFederations.map(
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
		})();

		return () => { mounted = false;};
	}, [JSON.stringify(containersAndFederations), selectedTemplate.code, JSON.stringify(filters)]);

	useEffect(() => {
		const filtTickets = tickets.filter(({ _id }) => filteredTicketsIDs.has(_id));
		setFilteredTickets(filtTickets);
	}, [tickets, filteredTicketsIDs]);

	
	useWatchPropertyChange(groupBy, () => setRefreshTableFlag(!refreshTableFlag));

	useEffect(() => {
		if (!templateAlreadyFetched(selectedTemplate) || presetFilters) return;
		setPresetFilters(getNonCompletedTicketFilters([selectedTemplate], containerOrFederation[0]));
	}, [selectedTemplate, presetFilters]);
	
	return (
		<TicketsFiltersContextComponent onChange={setFilters} templates={[selectedTemplate]} modelsIds={containersAndFederations} filters={presetFilters}>
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
	const [containersAndFederations] = useSearchParam('models', Transformers.STRING_ARRAY);

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

	useEffect(() => {
		if (containersAndFederations.includes(containerOrFederation)) return;
		clearTicketId();
	}, [containersAndFederations, containerOrFederation]);


	const onSaveTicket = (_id: string) => setTicketValue(containerOrFederation, _id, null, true);
	const selectedTemplate = ProjectsHooksSelectors.selectCurrentProjectTemplateById(template);

	return (
		<SidePanel open={!!ticketId && !!containerOrFederation}>
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
