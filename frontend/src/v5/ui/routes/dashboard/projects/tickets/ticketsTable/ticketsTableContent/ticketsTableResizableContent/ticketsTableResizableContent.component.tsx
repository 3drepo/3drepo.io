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
import { DashboardListCollapse } from '@components/dashboard/dashboardList';
import { CircledNumber } from '@controls/circledNumber/circledNumber.styles';
import { TicketsTableGroup } from '../ticketsTableGroup/ticketsTableGroup.component';
import { groupTickets, UNSET } from '../../ticketsTableGroupBy.helper';
import { Container, Title } from './ticketsTableResizableContent.styles';
import { TicketsTableContext } from '../../ticketsTableContext/ticketsTableContext';
import {  NEW_TICKET_ID, SetTicketValue, stripModuleOrPropertyPrefix } from '../../ticketsTable.helper';
import { Spinner } from '@controls/spinnerLoader/spinnerLoader.styles';
import { selectFetchingPropertiesByTicketId } from '@/v5/store/tickets/tickets.selectors';
import { getState } from '@/v5/helpers/redux.helpers';

export type TicketsTableResizableContentProps = {
	setTicketValue: SetTicketValue;
	selectedTicketId?: string;
};
export const TicketsTableResizableContent = ({ setTicketValue, selectedTicketId }: TicketsTableResizableContentProps) => {
	const { groupBy, getPropertyType, isJobAndUsersType } = useContext(TicketsTableContext);
	const { template } = useParams<DashboardTicketsParams>();
	const { filteredItems } = useContext(SearchContext);
	const onGroupNewTicket = (groupByValue: string) => (modelId: string) => {
		setTicketValue(modelId, NEW_TICKET_ID, (groupByValue === UNSET) ? null : groupByValue);
	};

	if (!groupBy) {
		return (
			<TicketsTableGroup
				tickets={filteredItems}
				onNewTicket={onGroupNewTicket('')}
				onEditTicket={setTicketValue}
				selectedTicketId={selectedTicketId}
			/>
		);
	}

	const propertyName = stripModuleOrPropertyPrefix(groupBy || '');
	const ticketsToDisplay = groupBy
		? filteredItems.filter(({ _id: ticketId }) => !selectFetchingPropertiesByTicketId(getState(), ticketId).has(propertyName))
		: filteredItems;

	const isLoading = groupBy && (ticketsToDisplay.length !== filteredItems.length);

	const groups = groupTickets(groupBy, filteredItems, getPropertyType(groupBy), isJobAndUsersType(groupBy));

	return (
		<Container>
			{groups.map(([groupName, tickets]) => (
				<DashboardListCollapse
					title={(
						<>
							<Title>{groupName}</Title>
							<CircledNumber disabled={!tickets.length || isLoading}>
								{isLoading ? <Spinner /> : tickets.length}
							</CircledNumber>
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
