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
import { BaseProperties, IssueProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import _ from 'lodash';
import { TicketsTableGroup } from './ticketsTableGroup/ticketsTableGroup.component';
import { getGroupByOptions, groupByDate, groupByList, NONE_OPTION } from '../ticketsTable.helper';
import { EmptyTicketsView } from '../../emptyTicketsView/emptyTicketsView.styles';
import { DashboardListCollapse } from '@components/dashboard/dashboardList';

type TicketsTableContentProps = { onTicketClick: (ticket: ITicket) => void };
export const TicketsTableContent = (props: TicketsTableContentProps) => {
	const { filteredItems } = useContext(SearchContext);
	const { groupBy } = useParams<DashboardTicketsParams>();

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

	if (groupBy === NONE_OPTION) return (<TicketsTableGroup tickets={filteredItems} {...props} />);

	let groups: Record<string, ITicket[]>;
	switch (groupBy) {
		case _.snakeCase(BaseProperties.OWNER):
			groups = _.groupBy(filteredItems, `properties.${BaseProperties.OWNER}`);
			break;
		case _.snakeCase(IssueProperties.DUE_DATE):
			groups = groupByDate(filteredItems);
			break;
		default:
			groups = groupByList(filteredItems, groupBy, getGroupByOptions(groupBy));
	}

	return (
		<>
			{_.entries(groups).map(([groupName, tickets]) => (
				<DashboardListCollapse
					title={<>{groupName} {tickets.length}</>}
					defaultExpanded={!!tickets.length}
					key={groupBy + groupName}
				>
					<TicketsTableGroup tickets={tickets} {...props} />
				</DashboardListCollapse>
			))}
		</>
	);
};
