/**
 *  Copyright (C) 2026 3D Repo Ltd
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
import { DashboardListCollapse } from '@components/dashboard/dashboardList';
import { CircledNumber } from '@controls/circledNumber/circledNumber.styles';
import { Spinner } from '@controls/spinnerLoader/spinnerLoader.styles';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { Title } from './ticketsTables.styles';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { SetTicketValue } from '../../ticketsTable.helper';
import { TicketsTable } from '../ticketsTable/ticketsTable.component';

type TicketsTableGroupProps = {
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

export const TicketsTableGroup = ({ 
	propertyValue, groupName, tickets, setTicketValue, selectedTicketId, onNewTicket, propertyName, expanded, onChangeCollapse,
}: TicketsTableGroupProps) => {
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