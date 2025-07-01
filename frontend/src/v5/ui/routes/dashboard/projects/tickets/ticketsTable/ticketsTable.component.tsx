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

import FunnelIcon from '@assets/icons/filters/funnel.svg';
import { ContainersActionsDispatchers, FederationsActionsDispatchers, JobsActionsDispatchers, ProjectsActionsDispatchers, TicketsActionsDispatchers, TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ContainersHooksSelectors, FederationsHooksSelectors, ProjectsHooksSelectors, TicketsCardHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams, generatePath, useHistory } from 'react-router-dom';
import ExpandIcon from '@assets/icons/outlined/expand_panel-outlined.svg';
import AddCircleIcon from '@assets/icons/filled/add_circle-filled.svg';
import { CircleButton } from '@controls/circleButton';
import { ThemeProvider as MuiThemeProvider, SelectChangeEvent } from '@mui/material';
import { theme } from '@/v5/ui/routes/viewer/theme';
import { combineSubscriptions } from '@/v5/services/realtime/realtime.service';
import { enableRealtimeNewTicket, enableRealtimeUpdateTicket } from '@/v5/services/realtime/ticket.events';
import { TicketContextComponent } from '@/v5/ui/routes/viewer/tickets/ticket.context';
import { isCommenterRole } from '@/v5/store/store.helpers';
import { TicketsTableContent } from './ticketsTableContent/ticketsTableContent.component';
import { Transformers, useSearchParam } from '../../../../useSearchParam';
import { DashboardTicketsParams, TICKETS_ROUTE, VIEWER_ROUTE } from '../../../../routes.constants';
import { ContainersAndFederationsSelect } from '../selectMenus/containersAndFederationsFormSelect.component';
import { GroupBySelect } from '../selectMenus/groupByFormSelect.component';
import { TemplateSelect } from '../selectMenus/templateFormSelect.component';
import { Link, ControlsContainer, NewTicketButton, SelectorsContainer, SidePanel, SlidePanelHeader, OpenInViewerButton, FlexContainer, NewFilterButton } from '../tickets.styles';
import { isValidFilter, NEW_TICKET_ID, NONE_OPTION } from './ticketsTable.helper';
import { NewTicketMenu } from './newTicketMenu/newTicketMenu.component';
import { NewTicketSlide } from '../ticketsList/slides/newTicketSlide.component';
import { TicketSlide } from '../ticketsList/slides/ticketSlide.component';
import { useSelectedModels } from './newTicketMenu/useSelectedModels';
import { templateAlreadyFetched } from '@/v5/store/tickets/tickets.helpers';
import { FilterSelection } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFiltersSelection.component';
import { CardFilters as TableFilters } from '@components/viewer/cards/cardFilters/cardFilters.component';
import { SearchContextComponent } from '@controls/search/searchContext';
import { useSetDefaultTicketFilters } from '@/v5/ui/routes/viewer/tickets/tickets.hooks';

const paramToInputProps = (value, setter) => ({
	value,
	onChange: (ev: SelectChangeEvent<unknown>) =>  setter((ev.target as HTMLInputElement).value),
});

export const TicketsTable = () => {
	const history = useHistory();
	const params = useParams<DashboardTicketsParams>();
	const { teamspace, project, template: templateId, ticketId } = params;
	const prevTemplate = useRef(undefined);

	const [containersAndFederations, setContainersAndFederations] = useSearchParam('models', Transformers.STRING_ARRAY, true);
	const [groupBy,, setGroupByParam] = useSearchParam('groupBy');
	const [groupByValue,, setGroupByValue] = useSearchParam('groupByValue');
	const [containerOrFederation,, setContainerOrFederation] = useSearchParam('containerOrFederation');
	const models = useSelectedModels();
	const [filtersInitialised, setFiltersInitialised] = useState(false);
	const setGroupBy = (val) => {
		// this is for clearing also the groupByValue when groupBy so we dont have an inconsistent groupByValue
		const search =  '?' + setGroupByValue(null,  setGroupByParam(val)); 
		history.push(location.pathname + search);
	};

	const setTemplate = useCallback((newTemplate) => {
		const newParams = { ...params, template: newTemplate };
		const path = generatePath(TICKETS_ROUTE + window.location.search, newParams);
		history.push(path);
	}, [params]);

	const setTicketValue = useCallback((modelId?: string,  ticket_id?: string, groupByVal?: string, replace: boolean = false) => {
		const id = (modelId && !ticket_id ) ? NEW_TICKET_ID : ticket_id;
		const newParams = { ...params, ticketId: id };
		const search = '?' + setGroupByValue(groupByVal, setContainerOrFederation(modelId));
		const path = generatePath(TICKETS_ROUTE +  search, newParams);

		if (replace) {
			history.replace(path);
		} else {
			history.push(path);
		}
	}, [params]);

	useEffect(() => {
		TicketsCardActionsDispatchers.setSelectedTicket(ticketId);
	}, [ticketId]);

	const isNewTicket = (ticketId || '').toLowerCase() === NEW_TICKET_ID;
	const clearTicketId = () => setTicketValue();

	const filters = TicketsCardHooksSelectors.selectCardFilters();
	const allTickets = TicketsHooksSelectors.selectTicketsByContainersAndFederations(containersAndFederations);
	const ticketHasBeenFetched = TicketsHooksSelectors.selectTicketsHaveBeenFetched();
	const allTicketsAreFetched = containersAndFederations.every(ticketHasBeenFetched);
	const filteredTickets = TicketsCardHooksSelectors.selectFilteredTickets(containersAndFederations)
		.filter(({ type }) => type === templateId);
	const selectedTemplate = ProjectsHooksSelectors.selectCurrentProjectTemplateById(templateId);
	const unusedFilters = TicketsCardHooksSelectors.selectAvailableTemplatesFilters(templateId).filter(({ type }) => type !== 'template');
	const [isNewTicketDirty, setIsNewTicketDirty] = useState(false);
	
	const isFed = FederationsHooksSelectors.selectIsFederation();

	const readOnly = isFed(containerOrFederation)
		? !FederationsHooksSelectors.selectHasCommenterAccess(containerOrFederation)
		: !ContainersHooksSelectors.selectHasCommenterAccess(containerOrFederation);
	
	
	const newTicketButtonIsDisabled = useMemo(() => 
		!models.length || models.filter(({ role }) => isCommenterRole(role)).length === 0,
	[models]);

	const onSaveTicket = (_id: string) => {
		setTicketValue(containerOrFederation, _id, null, true);
	};

	const getOpenInViewerLink = () => {
		if (!containerOrFederation) return '';

		const pathname = generatePath(VIEWER_ROUTE, {
			teamspace,
			project,
			containerOrFederation: containerOrFederation || '',
		});
		return pathname + (ticketId ? `?ticketId=${ticketId}` : '');
	};

	useSetDefaultTicketFilters([selectedTemplate]);

	useEffect(() => {
		if (!containersAndFederations.length ) return;

		containersAndFederations.forEach((modelId) => {
			if (ticketHasBeenFetched(modelId)) return;
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
	}, [containersAndFederations]);

	useEffect(() => {
		if (!containersAndFederations.length || !filtersInitialised || !allTicketsAreFetched) return;
		TicketsCardActionsDispatchers.fetchFilteredTickets(teamspace, project, containersAndFederations);
	}, [allTickets, filters, containersAndFederations, filtersInitialised, allTicketsAreFetched]);

	useEffect(() => {
		if (!filters.length || filtersInitialised) return;
		setFiltersInitialised(true);
	}, [!!filters.length, filtersInitialised]);

	useEffect(() => {
		JobsActionsDispatchers.fetchJobs(teamspace);
		TicketsActionsDispatchers.fetchRiskCategories(teamspace);
		return () => {
			TicketsCardActionsDispatchers.resetFilters();
		};
	}, []);

	useEffect(() => {
		TicketsCardActionsDispatchers.setReadOnly(readOnly);
	}, [readOnly]);

	useEffect(() => {
		if (!selectedTemplate || !filters.length) return;
		filters.forEach((filter) => {
			if (!isValidFilter(filter, selectedTemplate)) {
				TicketsCardActionsDispatchers.deleteFilter(filter);
			}
		});
	}, [selectedTemplate, filters]);

	useEffect(() => {
		if (prevTemplate.current && ticketId) clearTicketId();
		TicketsActionsDispatchers.setFilterableTemplatesIds([templateId]);
		prevTemplate.current = templateId;
		if (templateAlreadyFetched(selectedTemplate)) return;
		ProjectsActionsDispatchers.fetchTemplate(teamspace, project, templateId);
	}, [templateId]);

	return (
		<>
			<SearchContextComponent items={filteredTickets}>
				<ControlsContainer>
					<FlexContainer>
						<SelectorsContainer>
							<ContainersAndFederationsSelect
								isNewTicketDirty={isNewTicketDirty}
								{...paramToInputProps(containersAndFederations, setContainersAndFederations)}
							/>
							<TemplateSelect
								isNewTicketDirty={isNewTicketDirty}
								{...paramToInputProps(templateId, setTemplate)}
							/>
							<GroupBySelect 
								templateId={templateId}
								{...paramToInputProps(groupBy || NONE_OPTION, setGroupBy)}
							/>
						</SelectorsContainer>
					</FlexContainer>
					<FlexContainer>
						<FilterSelection
							unusedFilters={unusedFilters}
							TriggerButton={(props) => (
								<NewFilterButton {...props}
									startIcon={<FunnelIcon />}
									variant="outlined"
									color="secondary"
								>
									<FormattedMessage id="ticketsTable.button.newFilter" defaultMessage="Add filter" />
								</NewFilterButton>
							)}
						/>
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
				</ControlsContainer>
				<TableFilters />
				<TicketsTableContent setTicketValue={setTicketValue} selectedTicketId={ticketId} groupBy={groupBy}/>
				<SidePanel open={!!ticketId && !!containersAndFederations.length && !!containerOrFederation}>
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
					<MuiThemeProvider theme={theme}>
						<TicketContextComponent isViewer={false} containerOrFederation={containerOrFederation}>
							{!isNewTicket && (<TicketSlide ticketId={ticketId} template={selectedTemplate} />)}
							{isNewTicket && (
								<NewTicketSlide
									preselectedValue={{ [groupBy]: groupByValue }}
									template={selectedTemplate}
									containerOrFederation={containerOrFederation}
									onSave={onSaveTicket}
									onDirtyStateChange={setIsNewTicketDirty}
								/>
							)}
						</TicketContextComponent>
					</MuiThemeProvider>
				</SidePanel>
			</SearchContextComponent>
		</>
	);
};