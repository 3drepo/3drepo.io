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
import { TicketsTable } from '../ticketsTable/ticketsTable.component';
import { groupTickets, UNSET } from '../../../../../../../components/tickets/ticketsGroupBy.helper';
import { Container } from './groupedTables.styles';
import { TabularViewContext } from '../../tabularViewContext/tabularViewContext';
import {  NEW_TICKET_ID, SetTicketValue } from '../../ticketsTable.helper';
import { ITemplate } from '@/v5/store/tickets/tickets.types';
import { NONE_OPTION } from '@/v5/store/tickets/ticketsGroups.helpers';
import { VirtualList } from '@controls/virtualList/virtualList.component';
import { SortedTableContext } from '@controls/sortedTableContext/sortedTableContext';
import { TicketsTableGroup } from './ticketsGroupTable.component';

export type GroupedTablesProps = {
	setTicketValue: SetTicketValue;
	selectedTicketId?: string;
	template: ITemplate,
};

export const GroupedTables = ({ 
	setTicketValue, 
	selectedTicketId, 
	template,
}: GroupedTablesProps) => {
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
					<TicketsTableGroup
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
