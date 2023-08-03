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

import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { useEffect, useState } from 'react';
import { useStore } from 'react-redux';
import { selectFederationById } from '@/v5/store/federations/federations.selectors';
import { FormattedMessage } from 'react-intl';
import { formatMessage } from '@/v5/services/intl';
import { useParams, generatePath, useHistory } from 'react-router-dom';
import { SearchContextComponent } from '@controls/search/searchContext';
import { TicketWithModelId } from '@/v5/store/tickets/tickets.types';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { selectTicketsHaveBeenFetched } from '@/v5/store/tickets/tickets.selectors';
import ExpandIcon from '@assets/icons/outlined/expand_panel-outlined.svg';
import { CircleButton } from '@controls/circleButton';
import AddCircleIcon from '@assets/icons/filled/add_circle-filled.svg';
import { useContainersData } from '../containers/containers.hooks';
import { useFederationsData } from '../federations/federations.hooks';
import { TicketsList } from './ticketsList/ticketsList.component';	
import { useSearchParam } from '../../../useSearchParam';
import { DashboardTicketsParams, TICKETS_ROUTE } from '../../../routes.constants';
import { ContainersAndFederationsSelect } from './selectMenus/containersAndFederationsSelect.component';
import { GroupBySelect } from './selectMenus/groupBySelect.component';
import { TemplateSelect } from './selectMenus/templateSelect.component';
import { InputsContainer, NewTicketButton, SelectorsContainer, SearchInput, SidePanel, SlidePanelHeader, OpenInViewerButton, FlexContainer } from './tickets.styles';

export const TicketsTable = () => {
	const history = useHistory();
	const { teamspace, project, groupBy, template } = useParams<DashboardTicketsParams>();
	const [models, setModels] = useSearchParam('models');
	const selectedContainersAndFederations = models?.split(',') || [];
	const { getState } = useStore();

	const tickets = TicketsHooksSelectors.selectTicketsByContainersAndFederations(selectedContainersAndFederations);
	const { isListPending: areContainersPending } = useContainersData();
	const { isListPending: areFederationsPending } = useFederationsData();
	const isLoading = areContainersPending || areFederationsPending;
	const [editingTicket, setEditingTicket] = useState<TicketWithModelId>(undefined);
	const [isEditingTicket, setIsEditingTicket] = useState(false);

	const onSetEditingTicket = (ticket: TicketWithModelId) => {
		setEditingTicket(ticket);
		setIsEditingTicket(true);
	};

	const updateURL = ({ groupBy, template }: any) => {
		const newURL = generatePath(TICKETS_ROUTE, {
			teamspace,
			project,
			groupBy,
			template,
		});
		history.push(`${newURL}?models=${models}`);
	};

	useEffect(() => {
		if (isLoading || !selectedContainersAndFederations.length) return;

		const isFed = (modelId) => !!selectFederationById(getState(), modelId);

		selectedContainersAndFederations.forEach((modelId) => {
			if (selectTicketsHaveBeenFetched(getState(), modelId)) return;
			TicketsActionsDispatchers.fetchTickets(teamspace, project, modelId, isFed(modelId));
		});
	}, [selectedContainersAndFederations.length, isLoading]);

	useEffect(() => () => setModels(''), []);

	if (isLoading) return (<Loader />);

	return (
		<SearchContextComponent items={tickets} fieldsToFilter={['title']}>
			<InputsContainer>
				<SelectorsContainer>
					<ContainersAndFederationsSelect
						onChange={(value) => setModels(value.join(','))}
						value={selectedContainersAndFederations}
					/>
					<TemplateSelect
						onChange={(newTemplate) => updateURL({ template: newTemplate, groupBy })}
						value={template}
						defaultValue="none"
					/>
					<GroupBySelect
						onChange={(newGroupBy) => updateURL({ template, groupBy: newGroupBy })}
						value={groupBy}
						defaultValue="none"
					/>
				</SelectorsContainer>
				<FlexContainer>
					<SearchInput
						placeholder={formatMessage({ id: 'ticketsTable.search.placeholder', defaultMessage: 'Search...' })}
					/>
					<NewTicketButton
						startIcon={<AddCircleIcon />}
						onClick={() => onSetEditingTicket(null)}
					>
						<FormattedMessage id="ticketsTable.button.newTicket" defaultMessage="New Ticket" />
					</NewTicketButton>
				</FlexContainer>
			</InputsContainer>
			<TicketsList onSelectTicket={onSetEditingTicket} />
			<SidePanel open={isEditingTicket}>
				<SlidePanelHeader>
					<OpenInViewerButton disabled={!editingTicket?._id}>
						<FormattedMessage
							id="ticketsTable.button.openInViewer"
							defaultMessage="Open in viewer"
						/>
					</OpenInViewerButton>
					<CircleButton onClick={() => setIsEditingTicket(false)}>
						<ExpandIcon />
					</CircleButton>
				</SlidePanelHeader>
				{editingTicket?._id && (<div>Editing ticket {editingTicket.title}</div>)}
				{!editingTicket?._id && (<div>attempting to create a new ticket</div>)}
			</SidePanel>
		</SearchContextComponent>
	);
};
