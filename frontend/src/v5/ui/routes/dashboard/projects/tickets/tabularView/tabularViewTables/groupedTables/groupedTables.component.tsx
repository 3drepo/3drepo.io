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

import { useCallback, useContext, useEffect, useRef } from 'react';
import { DashboardListCollapse } from '@components/dashboard/dashboardList';
import { CircledNumber } from '@controls/circledNumber/circledNumber.styles';
import { TicketsTable } from '../ticketsTable/ticketsTable.component';
import { groupTickets, UNSET } from '../../ticketsTableGroupBy.helper';
import { Container, Title } from './groupedTables.styles';
import { TabularViewContext } from '../../tabularViewContext/tabularViewContext';
import {  NEW_TICKET_ID, SetTicketValue } from '../../ticketsTable.helper';
import { Spinner } from '@controls/spinnerLoader/spinnerLoader.styles';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { ITemplate, ITicket } from '@/v5/store/tickets/tickets.types';
import { NONE_OPTION } from '@/v5/store/tickets/ticketsGroups.helpers';
import { VirtualList } from '@controls/virtualList/virtualList.component';
import { SortedTableContext } from '@controls/sortedTableContext/sortedTableContext';

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

const TicketsGroup = ({ 
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
		unmountHidden
	>
		<TicketsTable
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
	template: ITemplate,
};

export const GroupedTables = ({ 
	setTicketValue, 
	selectedTicketId, 
	template,
}: TicketsTableResizableContentProps) => {
	const { groupBy } = useContext(TabularViewContext);
	const collapsedGroups = useRef<Record<string, boolean>>({});
	const tickets = useContext(SortedTableContext).sortedItems;

	const onGroupNewTicket = (groupByValue: string) => (modelId: string) => {
		const presetValue = { key: groupBy, value: (groupByValue === UNSET) ? null : groupByValue };
		setTicketValue(modelId, NEW_TICKET_ID, presetValue);
	};

	const onChangeCollapse = useCallback((groupVal, collapse) => {
		collapsedGroups.current[groupVal] = collapse;
	}, [collapsedGroups.current]);

	useEffect(() => {
		collapsedGroups.current = {};
	}, [groupBy]);

	if (groupBy === NONE_OPTION) {
		return (
			<TicketsTable
				tickets={tickets}
				onNewTicket={onGroupNewTicket('')}
				onEditTicket={setTicketValue}
				selectedTicketId={selectedTicketId}
			/>
		);
	}
	
	const groups = groupTickets(groupBy, [template], tickets);

	return (
		<Container>
			<VirtualList
				items={groups}
				itemHeight={45}
				vKey='groups-list'
				ItemComponent={({ groupName, value, tickets: groupedTickets }) => (
					<TicketsGroup
						groupName={groupName}
						tickets={groupedTickets}
						setTicketValue={setTicketValue}
						onNewTicket={onGroupNewTicket}
						selectedTicketId={selectedTicketId}
						propertyValue={value}
						propertyName={groupBy}
						onChangeCollapse={(collapsed) => onChangeCollapse(value, collapsed)}
						expanded={collapsedGroups.current[value] === undefined ? groupedTickets.length > 0 : !collapsedGroups.current[value] }
						key={groupBy + groupName + template._id }
					/>
				)} 
			/>
		</Container>
	);
};
