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
import { TeamspacesHooksSelectors, ProjectsHooksSelectors, TicketsHooksSelectors, FederationsHooksSelectors, ContainersHooksSelectors } from '@/v5/services/selectorsHooks';
import { MultiSelectMenuItem } from '@controls/inputs/multiSelect/multiSelectMenuItem/multiSelectMenuItem.component';
import { SearchSelect } from '@controls/searchSelect/searchSelect.component';
import { Drawer, MenuItem, Select, SelectProps } from '@mui/material';
import { useEffect, useState } from 'react';
import { useStore } from 'react-redux';
import { selectContainersByFederationId } from '@/v5/store/federations/federations.selectors';
import { useContainersData } from '../containers/containers.hooks';
import { useFederationsData } from '../federations/federations.hooks';

const FederationsAndContainerSelect = (props) => {
	const containers = ContainersHooksSelectors.selectContainers();
	const federations = FederationsHooksSelectors.selectFederations();

	return (
		<SearchSelect
			multiple
			{...props}
			renderValue={(val) => {
				const itemsSelected = (val as (any[] | null) || []).length;
				if (itemsSelected === 1) {
					const id = val[0];
					return (containers.find(({ _id }) => _id === id) || federations.find(({ _id }) => _id === id)).name;
				}

				if (itemsSelected > 1) {
					return `${itemsSelected} selected`;
				}
				return 'Select something';
			}}
		>
			{/* Clicking here should select all other items? */}
			<MultiSelectMenuItem value="all">
				ALL
			</MultiSelectMenuItem>
			<h2>Federations:</h2>
			{ federations.map((federation) => (
				<MultiSelectMenuItem value={federation._id}>{federation.name}</MultiSelectMenuItem>))}
			<h2>Containers:</h2>
			{ containers.map((container) => (
				<MultiSelectMenuItem value={container._id}>{container.name}</MultiSelectMenuItem>))}
		</SearchSelect>
	);
};

const TemplatesSelect = (props: SelectProps<string>) => (
	<Select
		{...props}
	>
		{/* Clicking here should select all other items? */}
		<MenuItem value="none">
			None
		</MenuItem>
		<MenuItem value="id-template1">
			A template
		</MenuItem>
		<MenuItem value="id-template2">
			Another template
		</MenuItem>
	</Select>
);

const GroupBySelect = (props: SelectProps<string>) => (
	<Select
		{...props}
	>
		{/* Clicking here should select all other items? */}
		<MenuItem value="none">
			None
		</MenuItem>
		<MenuItem value="Ass">
			Assignee
		</MenuItem>
		<MenuItem value="id-template2">
			Due date
		</MenuItem>
		<MenuItem value="id-template2">
			Priority
		</MenuItem>
		<MenuItem value="id-template2">
			Status
		</MenuItem>
		<MenuItem value="id-template2">
			Owner
		</MenuItem>
		<MenuItem value="id-template2">
			Level of risk
		</MenuItem>
		<MenuItem value="id-template2">
			Treatment status
		</MenuItem>
	</Select>
);

export const TicketsTable = () => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const { getState } = useStore();

	const project = ProjectsHooksSelectors.selectCurrentProject();
	const [selectedFedOrContainers, setSelectedFedOrContainers] = useState([]);
	const [selectedTemplate, setSelectedTemplate] = useState(undefined);
	const [selectedGroupBy, setSelectedGroupBy] = useState(undefined);
	const tickets = TicketsHooksSelectors.selectTicketsByFedAndContainers(selectedFedOrContainers);
	const { isListPending: areContainersPending } = useContainersData();
	const { isListPending: areFederationsPending } = useFederationsData();
	const [onEdition, setOnEdition] = useState(false);
	const [editingTicket, setEditingTicket] = useState(null);

	useEffect(() => {
		setOnEdition(false);
		if (areContainersPending || areFederationsPending) return;
		const isFed = (modelId) => !!selectContainersByFederationId(getState(), modelId).length;

		selectedFedOrContainers.forEach((modelId) => {
			TicketsActionsDispatchers.fetchTickets(teamspace, project, modelId, isFed(modelId));
		});
	}, [teamspace, project, selectedFedOrContainers, areContainersPending, areFederationsPending]);

	const editTicket = (ticket) => {
		setEditingTicket(ticket);
		setOnEdition(true);
	};
	return (
		<>
			<div>
				<FederationsAndContainerSelect onChange={(event) => setSelectedFedOrContainers(event.target.value)} value={selectedFedOrContainers} />
				<TemplatesSelect onChange={(event) => setSelectedTemplate(event.target.value)} value={selectedTemplate} defaultValue="none" />
				<GroupBySelect onChange={(event) => setSelectedGroupBy(event.target.value)} value={selectedGroupBy} defaultValue="none" />
				<button onClick={() => editTicket(null)}> New ticket</button>
			</div>
			{tickets.map((t) => (
				<h1>{t.title} <button onClick={() => editTicket(t)}> edit </button>
				</h1>
			))}
			<Drawer
				variant="persistent"
				anchor="right"
				open={onEdition}
				onClose={() => setOnEdition(false)}
				SlideProps={{ unmountOnExit: true }}
			>
				{editingTicket?._id && <>Editing form for {editingTicket.title}</>}
				{!editingTicket?._id && <>Editing form for a new ticket</>}
			</Drawer>
		</>
	);
};
