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

import { TeamspacesActionsDispatchers, TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { TicketsHooksSelectors, FederationsHooksSelectors, ContainersHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { MultiSelectMenuItem } from '@controls/inputs/multiSelect/multiSelectMenuItem/multiSelectMenuItem.component';
import { Box, MenuItem } from '@mui/material';
import { useEffect, useState } from 'react';
import { useStore } from 'react-redux';
import { selectFederationById } from '@/v5/store/federations/federations.selectors';
import { useContainersData } from '../containers/containers.hooks';
import { useFederationsData } from '../federations/federations.hooks';
import { FormattedMessage } from 'react-intl';
import { formatMessage } from '@/v5/services/intl';
import { useParams, generatePath, useHistory } from 'react-router-dom';
import { InputsContainer, ListSubheader, NewTicketButton, SelectorsContainer, SearchInput, SidePanel, SlidePanelHeader, OpenInViewerButton } from './tickets.styles';
import { Select, SelectProps } from '@controls/inputs/select/select.component';
import { SearchContextComponent } from '@controls/search/searchContext';
import AddCircleIcon from '@assets/icons/filled/add_circle-filled.svg';
import { SearchSelect } from '@controls/searchSelect/searchSelect.component';
import { TicketsList } from './ticketsList/ticketsList.component';
import { TicketSlide } from './ticketSlide/ticketSlide.component';
import { IssueProperties } from '../../../viewer/tickets/tickets.constants';
import { ITemplate, TicketWithModelId } from '@/v5/store/tickets/tickets.types';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { selectTicketsHaveBeenFetched } from '@/v5/store/tickets/tickets.selectors';
import ExpandIcon from '@assets/icons/outlined/expand_panel-outlined.svg';
import { CircleButton } from '@controls/circleButton';
import { useSearchParam } from '../../../useSearchParam';
import { DashboardTicketsParams, TICKETS_ROUTE } from '../../../routes.constants';

const FederationsAndContainerSelect = (props) => {
	const containers = ContainersHooksSelectors.selectContainers();
	const federations = FederationsHooksSelectors.selectFederations();

	return (
		<SearchSelect
			multiple
			{...props}
			placeholder={formatMessage({ id: 'ticketTable.modelSelection.placeholder', defaultMessage: 'Select something' })}
			renderValue={(ids: any[] | null = []) => {
				const itemsLength = ids.length;
				if (itemsLength === 1) {
					const [id] = ids;
					return (containers.find(({ _id }) => _id === id) || federations.find(({ _id }) => _id === id)).name;
				}

				return formatMessage({
					id: 'ticketTable.modelSelection.selected',
					defaultMessage: '{itemsLength} selected',
				}, { itemsLength });
			}}
		>
			<ListSubheader>
				<FormattedMessage id="ticketTable.modelSelection.federations" defaultMessage="Federations" />
			</ListSubheader>
			{federations.map((federation) => (
				<MultiSelectMenuItem value={federation._id}>{federation.name}</MultiSelectMenuItem>
			))}
			<ListSubheader>
				<FormattedMessage id="ticketTable.modelSelection.containers" defaultMessage="Containers" />
			</ListSubheader>
			{containers.map((container) => (
				<MultiSelectMenuItem value={container._id}>{container.name}</MultiSelectMenuItem>
			))}
		</SearchSelect>
	);
};

type GroupBySelectType = SelectProps & { values: string[] };
const GroupBySelect = ({ values, onChange, ...props }: GroupBySelectType) => (
	<Select {...props} onChange={(e) => onChange(e.target.value)}>
		{values.map((val) => (<MenuItem value={val.toLocaleLowerCase()}>{val}</MenuItem>))}
	</Select>
);

type TemplateSelectType = SelectProps & { values: ITemplate[] }
const TemplateSelect = ({ values, onChange, ...props }: TemplateSelectType) => (
	<Select {...props} onChange={(e) => onChange(e.target.value)}>
		{values.map(({ _id, name }) => (<MenuItem value={_id}>{name}</MenuItem>))}
	</Select>
);

export const TicketsTable = () => {
	const history = useHistory();
	const { teamspace, project, groupBy, template } = useParams<DashboardTicketsParams>();
	const templates = TeamspacesHooksSelectors.selectCurrentTeamspaceTemplates();
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
		history.push(newURL);
	};

	useEffect(() => {
		if (isLoading || !selectedContainersAndFederations.length) return;

		const isFed = (modelId) => !!selectFederationById(getState(), modelId);

		selectedContainersAndFederations.forEach((modelId) => {
			if (selectTicketsHaveBeenFetched(getState(), modelId)) return;
			TicketsActionsDispatchers.fetchTickets(teamspace, project, modelId, isFed(modelId));
		});
	}, [selectedContainersAndFederations.length, isLoading]);

	useEffect(() => {
		TeamspacesActionsDispatchers.fetchTemplates(teamspace);
		return () => setModels('');
	}, []);

	if (isLoading) return (<Loader />);

	return (
		<SearchContextComponent items={tickets} fieldsToFilter={['title']}>
			<InputsContainer>
				<SelectorsContainer>
					<FederationsAndContainerSelect
						onChange={(event) => setModels(event.target.value?.join(',') || '')}
						value={selectedContainersAndFederations}
					/>
					<TemplateSelect
						onChange={(newTemplate) => updateURL({ template: newTemplate, groupBy })}
						value={template}
						defaultValue="none"
						values={templates}
					/>
					<GroupBySelect
						onChange={(newGroupBy) => updateURL({ template, groupBy: newGroupBy })}
						value={groupBy}
						defaultValue="none"
						values={Object.values(IssueProperties)}
					/>
				</SelectorsContainer>
				<Box>
					<SearchInput
						placeholder={formatMessage({ id: 'ticketTable.search.placeholder', defaultMessage: 'Search...' })}
					/>
					<NewTicketButton
						startIcon={<AddCircleIcon />}
						onClick={() => onSetEditingTicket(null)}
					>
						<FormattedMessage id="ticketTable.button.newTicket" defaultMessage="New Ticket" />
					</NewTicketButton>
				</Box>
			</InputsContainer>
			<TicketsList onSelectTicket={onSetEditingTicket} />
			<SidePanel open={isEditingTicket}>
				<SlidePanelHeader>
					<OpenInViewerButton disabled={!editingTicket?._id}>
						<FormattedMessage
							id="ticketTable.button.openInViewer"
							defaultMessage="Open in viewer"
						/>
					</OpenInViewerButton>
					<CircleButton onClick={() => setIsEditingTicket(false)}>
						<ExpandIcon />
					</CircleButton>
				</SlidePanelHeader>
				{editingTicket?._id && (<TicketSlide ticketWithModelId={editingTicket} />)}
				{/* {!editingTicket?._id && <NewTicketSlide>Editing form for a new ticket</NewTicketSlide>} */}
			</SidePanel>
		</SearchContextComponent>
	);
};
