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

import { SearchContext } from '@controls/search/searchContext';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import _ from 'lodash';
import { DashboardListCollapse } from '@components/dashboard/dashboardList';
import { CircledNumber } from '@controls/circledNumber/circledNumber.styles';
import { TicketsTableGroup } from '../ticketsTableGroup/ticketsTableGroup.component';
import {  groupTickets, NEW_TICKET_ID, NONE_OPTION, SetTicketValue, UNSET } from '../../ticketsTable.helper';
import { Container, Title } from './ticketsTableResizableContent.styles';

export type TicketsTableResizableContentProps = {
	setTicketValue: SetTicketValue;
	groupBy: string
	selectedTicketId?: string;
};
export const TicketsTableResizableContent = ({ setTicketValue, groupBy, selectedTicketId }: TicketsTableResizableContentProps) => {
	const { template } = useParams<DashboardTicketsParams>();
	const { filteredItems } = useContext(SearchContext);
	const onGroupNewTicket = (groupByValue: string) => (modelId: string) => {
		setTicketValue(modelId, NEW_TICKET_ID, (groupByValue === UNSET) ? null : groupByValue);
	};

	if (groupBy === NONE_OPTION || !groupBy) {
		return (
			<TicketsTableGroup
				tickets={filteredItems}
				onNewTicket={onGroupNewTicket('')}
				onEditTicket={setTicketValue}
				selectedTicketId={selectedTicketId}
			/>
		);
	}

	const groups = groupTickets(groupBy, filteredItems);

	return (
		<Container>
			{_.entries(groups).map(([groupName, tickets]) => (
				<DashboardListCollapse
					title={(
						<>
							<Title>{groupName}</Title>
							<CircledNumber disabled={!tickets.length}>{tickets.length}</CircledNumber>
						</>
					)}
					defaultExpanded={!!tickets.length}
					key={groupBy + groupName + template + tickets}
				>
					<TicketsTableGroup
						tickets={tickets}
						onNewTicket={onGroupNewTicket(groupName)}
						onEditTicket={setTicketValue}
						selectedTicketId={selectedTicketId}
					/>
				</DashboardListCollapse>
			))}
		</Container>
	);
};
