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
import { ProjectsHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatMessage } from '@/v5/services/intl';
import { useParams, generatePath, useHistory } from 'react-router-dom';
import { SearchContextComponent } from '@controls/search/searchContext';
import AddCircleIcon from '@assets/icons/filled/add_circle-filled.svg';
import TickIcon from '@assets/icons/outlined/tick-outlined.svg';
import { SelectChangeEvent } from '@mui/material';
import { combineSubscriptions } from '@/v5/services/realtime/realtime.service';
import { enableRealtimeNewTicket, enableRealtimeUpdateTicket } from '@/v5/services/realtime/ticket.events';
import { isCommenterRole } from '@/v5/store/store.helpers';
import { TicketsTableContent } from './ticketsTableContent/ticketsTableContent.component';
import { Transformers, useSearchParam } from '../../../../useSearchParam';
import { DashboardTicketsParams, TICKETS_ROUTE } from '../../../../routes.constants';
import { ContainersAndFederationsSelect } from '../selectMenus/containersAndFederationsFormSelect.component';
import { GroupBySelect } from '../selectMenus/groupBySelect.component';
import { TemplateSelect } from '../selectMenus/templateFormSelect.component';
import { FiltersContainer, NewTicketButton, SelectorsContainer, SearchInput, FlexContainer, CompletedChip } from '../tickets.styles';
import { NEW_TICKET_ID } from './ticketsTable.helper';
import { NewTicketMenu } from './newTicketMenu/newTicketMenu.component';
import { useSelectedModels } from './newTicketMenu/useSelectedModels';
import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { templateAlreadyFetched } from '@/v5/store/tickets/tickets.helpers';
import { TicketsTableContext } from './ticketsTableContext/ticketsTableContext';
import { ticketIsCompleted } from '@controls/chip/statusChip/statusChip.helpers';
import { useContextWithCondition } from '@/v5/helpers/contextWithCondition/contextWithCondition.hooks';
import { selectTicketsHaveBeenFetched } from '@/v5/store/tickets/tickets.selectors';
import { getState } from '@/v5/helpers/redux.helpers';
import { useWatchPropertyChange } from './useWatchPropertyChange';
import { selectIsFederation } from '@/v5/store/federations/federations.selectors';
import { TicketsTableSidePanel } from './ticketsTableSidePanel/ticketsTableSidePanel.component';

const paramToInputProps = (value, setter) => ({
	value,
	onChange: (ev: SelectChangeEvent<unknown>) =>  setter((ev.target as HTMLInputElement).value),
});

export const TicketsTable = () => {
	const [refreshTableFlag, setRefreshTableFlag] = useState(false);
	const history = useHistory();
	const params = useParams<DashboardTicketsParams>();
	const { teamspace, project, template, ticketId } = params;

	const prevTemplate = useRef(undefined);
	const { getSelectedTicket, onSelectedTicketChange, setModelAndTicketId, groupBy, fetchColumn } = useContext(TicketsTableContext);
	const { visibleSortedColumnsNames } = useContextWithCondition(ResizableTableContext, ['visibleSortedColumnsNames']);

	const [containersAndFederations, setContainersAndFederations] = useSearchParam('models', Transformers.STRING_ARRAY, true);
	const [showCompleted, setShowCompleted] = useSearchParam('showCompleted', Transformers.BOOLEAN, true);
	const [presetValue, setPresetValue] = useState('');
	const models = useSelectedModels();

	const setTemplate = useCallback((newTemplate) => {
		const newParams = { ...params, template: newTemplate };
		const path = generatePath(TICKETS_ROUTE + window.location.search, newParams);
		history.push(path);
	}, [params]);

	const setTicketValue = useCallback((modelId?: string, ticket_id?: string, groupByVal?: string) => {
		const id = (modelId && !ticket_id) ? NEW_TICKET_ID : ticket_id;
		setModelAndTicketId(modelId, id);
		setPresetValue(groupByVal);
	}, [setModelAndTicketId]);

	useEffect(() => {
		return onSelectedTicketChange(TicketsCardActionsDispatchers.setSelectedTicket);
	}, [onSelectedTicketChange]);

	const clearTicketId = () => setTicketValue();

	const tickets = TicketsHooksSelectors.selectTicketsByContainersAndFederations(containersAndFederations);
	const templates = ProjectsHooksSelectors.selectCurrentProjectTemplates();
	const selectedTemplate = ProjectsHooksSelectors.selectCurrentProjectTemplateById(template);
	const [isNewTicketDirty, setIsNewTicketDirty] = useState(false);
	
	const ticketsFilteredByTemplate = useMemo(() => {
		const ticketsToShow = tickets.filter((t) => ticketIsCompleted(t, selectedTemplate) === showCompleted);
		return ticketsToShow.filter(({ type }) => type === template);
	}, [template, tickets, showCompleted]);
	
	const newTicketButtonIsDisabled = useMemo(() => 
		!containersAndFederations.length || models.filter(({ role }) => isCommenterRole(role)).length === 0,
	[models, !!containersAndFederations.length]);

	const filterTickets = useCallback((items, query: string) => items.filter((ticket) => {
		const templateCode = templates.find(({ _id }) => _id === ticket.type).code;
		const ticketCode = `${templateCode}:${ticket.number}`;

		const elementsToFilter = [ticketCode, ticket.title];
		if (containersAndFederations.length > 1) {
			elementsToFilter.push(ticket.modelName);
		}
		return elementsToFilter.some((str = '') => str.toLowerCase().includes(query.toLowerCase()));
	}), [templates]);

	useEffect(() => {
		if (!models.length) return;

		const isFed = selectIsFederation(getState());
		containersAndFederations.forEach((modelId) => {
			if (selectTicketsHaveBeenFetched(getState())(modelId)) return;
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
		if (templates.length) return;
		ProjectsActionsDispatchers.fetchTemplates(teamspace, project);
	}, []);

	useEffect(() => {
		if (prevTemplate.current && getSelectedTicket()) clearTicketId();
		prevTemplate.current = template;
		if (!templateAlreadyFetched(selectedTemplate)) {
			ProjectsActionsDispatchers.fetchTemplate(teamspace, project, template);
		}
		if (ticketId) {
			clearTicketId();
		}
	}, [template]);

	useEffect(() => {
		setPresetValue('');
	}, [groupBy]);

	useEffect(() => {
		visibleSortedColumnsNames.forEach((name) => fetchColumn(name, ticketsFilteredByTemplate));
	}, [ticketsFilteredByTemplate.length, visibleSortedColumnsNames.join('')]);

	useWatchPropertyChange(groupBy, () => setRefreshTableFlag(!refreshTableFlag));
	return (
		<SearchContextComponent items={ticketsFilteredByTemplate} filteringFunction={filterTickets}>
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
					<CompletedChip
						icon={<TickIcon />}
						label={formatMessage({ id: 'ticketsTable.filters.completed', defaultMessage: 'Completed' })}
						selected={showCompleted}
						onClick={() => setShowCompleted(!showCompleted)}
					/>
				</FlexContainer>
				<FlexContainer>
					<SearchInput
						placeholder={formatMessage({ id: 'ticketsTable.search.placeholder', defaultMessage: 'Search...' })}
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
			</FiltersContainer>
			<TicketsTableContent setTicketValue={setTicketValue} />
			<TicketsTableSidePanel setIsNewTicketDirty={setIsNewTicketDirty} setTicketValue={setTicketValue} presetValue={presetValue} />
		</SearchContextComponent>
	);
};