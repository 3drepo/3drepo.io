/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { useCallback, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import { DashboardListCollapse } from '@components/dashboard/dashboardList';
import { CircledNumber } from '@controls/circledNumber/circledNumber.styles';
import { TicketsTableGroup } from '../ticketsTableGroup/ticketsTableGroup.component';
import { groupTickets, UNSET } from '../../ticketsTableGroupBy.helper';
import { Container, Title } from './ticketsTableResizableContent.styles';
import { TicketsTableContext } from '../../ticketsTableContext/ticketsTableContext';
import {  NEW_TICKET_ID, SetTicketValue } from '../../ticketsTable.helper';
import { Spinner } from '@controls/spinnerLoader/spinnerLoader.styles';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { NONE_OPTION } from '@/v5/store/tickets/ticketsGroups.helpers';
import { VirtualList2 } from '@controls/virtualList/virtualList2.component';

type CollapsibleTicketsGroupProps = {
	propertyValue: string;
	groupName: string;
	tickets: ITicket[];
	setTicketValue: SetTicketValue;
	selectedTicketId?: string;
	onNewTicket: (groupByValue: string) => (modelId: string) => void;
	propertyName: string;
	expanded: boolean;
	onChangeCollapse: (collapse: boolean) => void;
};

const CollapsibleTicketsGroup = ({ 
	propertyValue, groupName, tickets, setTicketValue, selectedTicketId, onNewTicket, propertyName, expanded, onChangeCollapse,
}: CollapsibleTicketsGroupProps) => {
	const ticketsIds = tickets.map(({ _id }) => _id);
	const isLoading = !TicketsHooksSelectors.selectPropertyFetchedForTickets(ticketsIds, propertyName);

	return (<DashboardListCollapse
		title={(
			<>
				<Title>{groupName}</Title>
				<CircledNumber disabled={!tickets.length || isLoading}>
					{isLoading ? <Spinner /> : tickets.length}
				</CircledNumber>
			</>
		)}
		defaultExpanded={expanded}
		onChangeCollapse={onChangeCollapse}
	>
		<TicketsTableGroup
			tickets={tickets}
			onNewTicket={onNewTicket(propertyValue)}
			onEditTicket={setTicketValue}
			selectedTicketId={selectedTicketId}
		/>
	</DashboardListCollapse>);
};

export type TicketsTableResizableContentProps = {
	setTicketValue: SetTicketValue;
	selectedTicketId?: string;
	tickets: ITicket[],
};

export const TicketsTableResizableContent = ({ setTicketValue, selectedTicketId, tickets: filteredItems }: TicketsTableResizableContentProps) => {
	const { groupBy, getPropertyType, isJobAndUsersType } = useContext(TicketsTableContext);
	const { template } = useParams<DashboardTicketsParams>();
	const collapsedGroups = useRef<Record<string, boolean>>({});

	const onGroupNewTicket = (groupByValue: string) => (modelId: string) => {
		const presetValue = { key: groupBy, value: (groupByValue === UNSET) ? null : groupByValue };
		setTicketValue(modelId, NEW_TICKET_ID, presetValue);
	};

	if (groupBy === NONE_OPTION) {
		return (
			<TicketsTableGroup
				tickets={filteredItems}
				onNewTicket={onGroupNewTicket('')}
				onEditTicket={setTicketValue}
				selectedTicketId={selectedTicketId}
			/>
		);
	}

	const groups = groupTickets(groupBy, filteredItems, getPropertyType(groupBy), isJobAndUsersType(groupBy));

	const onChangeCollapse = useCallback((groupVal, collapse) => {
		collapsedGroups.current[groupVal] = collapse;
	}, [collapsedGroups.current]);

	return (
		<Container>
			<VirtualList2
				items={groups}
				itemHeight={45}
				ItemComponent={({ groupName, value, tickets }) => (
					<CollapsibleTicketsGroup
						groupName={groupName}
						tickets={tickets}
						setTicketValue={setTicketValue}
						onNewTicket={onGroupNewTicket}
						selectedTicketId={selectedTicketId}
						propertyValue={value}
						propertyName={groupBy}
						onChangeCollapse={(collapsed) => onChangeCollapse(value, collapsed)}
						expanded={collapsedGroups.current[value] === undefined ? tickets.length > 0 : !collapsedGroups.current[value] }
						key={groupBy + groupName + template + tickets}
					/>
				)} 
			/>
			
		</Container>
	);
};
