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

import { SearchContext } from '@controls/search/searchContext';
import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { useParams } from 'react-router-dom';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import _ from 'lodash';
import { DashboardListCollapse } from '@components/dashboard/dashboardList';
import { CircledNumber } from '@controls/circledNumber/circledNumber.styles';
import { TicketsTableGroup } from './ticketsTableGroup/ticketsTableGroup.component';
import { GROUP_BY_URL_PARAM_TO_TEMPLATE_CASE, groupTickets, NONE_OPTION } from '../ticketsTable.helper';
import { EmptyTicketsView } from '../../emptyTicketsView/emptyTicketsView.styles';
import { Container } from './ticketsTableContent.styles';

type TicketsTableContentProps = {
	onEditTicket: (ticket: Partial<ITicket>) => void;
	onNewTicket: (modelId: string, ticket?: Partial<ITicket>) => void;
};
export const TicketsTableContent = ({ onNewTicket, ...props }: TicketsTableContentProps) => {
	const { filteredItems } = useContext(SearchContext);
	const { groupBy: groupByAsURLParam } = useParams<DashboardTicketsParams>();
	const groupBy = GROUP_BY_URL_PARAM_TO_TEMPLATE_CASE[groupByAsURLParam];

	const onGroupNewTicket = (group: string) => (modelId: string) => {
		onNewTicket(modelId, {});
	};

	if (!filteredItems.length) {
		return (
			<EmptyTicketsView>
				<FormattedMessage
					id="ticketTable"
					defaultMessage="We couldn't find any tickets to show. Please refine your selection."
				/>
			</EmptyTicketsView>
		);
	}

	if (groupBy === NONE_OPTION) return (<TicketsTableGroup tickets={filteredItems} onNewTicket={onGroupNewTicket(null)}  {...props} />);

	const groups = groupTickets(groupBy, filteredItems);

	return (
		<Container>
			{_.entries(groups).map(([groupName, tickets]) => (
				<DashboardListCollapse
					title={<>{groupName} <CircledNumber disabled={!tickets.length}>{tickets.length}</CircledNumber></>}
					defaultExpanded={!!tickets.length}
					key={groupBy + groupName}
				>
					<TicketsTableGroup tickets={tickets} onNewTicket={onGroupNewTicket} {...props} />
				</DashboardListCollapse>
			))}
		</Container>
	);
};
