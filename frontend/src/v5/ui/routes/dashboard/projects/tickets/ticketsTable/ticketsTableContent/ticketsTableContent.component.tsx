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
import { useParams } from 'react-router-dom';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import _ from 'lodash';
import { DashboardListCollapse } from '@components/dashboard/dashboardList';
import { CircledNumber } from '@controls/circledNumber/circledNumber.styles';
import { TicketsTableGroup } from './ticketsTableGroup/ticketsTableGroup.component';
import {  groupTickets, NEW_TICKET_ID, NONE_OPTION, SetTicketValue, UNSET } from '../ticketsTable.helper';
import { EmptyPageView } from '../../../../../../components/shared/emptyPageView/emptyPageView.styles';
import { Container, Title } from './ticketsTableContent.styles';
import { BaseProperties, IssueProperties, SafetibaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { ResizableColumnsContextComponent, WidthsType } from '@controls/resizableColumnsContext/resizableColumnsContext';

type TicketsTableContentProps = {
	setTicketValue: SetTicketValue;
	groupBy: string
	selectedTicketId?: string;
};
export const TicketsTableContent = ({ setTicketValue, selectedTicketId, groupBy }: TicketsTableContentProps) => {
	const { filteredItems } = useContext(SearchContext);
	const { template } = useParams<DashboardTicketsParams>();
	
	const widths: WidthsType = {
		id: { initial: 80, min: 25 },
		[BaseProperties.TITLE]: { initial: 380, min: 25 },
		modelName: { initial: 145, min: 25 },
		[`properties.${BaseProperties.CREATED_AT}`]: { initial: 127, min: 25 },
		[`properties.${IssueProperties.ASSIGNEES}`]: { initial: 96, min: 25 }, 
		[`properties.${BaseProperties.OWNER}`]: { initial: 52, min: 25 },
		[`properties.${IssueProperties.DUE_DATE}`]: { initial: 147, min: 25 },
		[`properties.${IssueProperties.PRIORITY}`]: { initial: 90, min: 25 },
		[`properties.${BaseProperties.STATUS}`]: { initial: 150, min: 52 },
		[`modules.safetibase.${SafetibaseProperties.LEVEL_OF_RISK}`]: { initial: 137, min: 25 },
		[`modules.safetibase.${SafetibaseProperties.TREATMENT_STATUS}`]: { initial: 134, min: 25 },
	};
	
	const onGroupNewTicket = (groupByValue: string) => (modelId: string) => {
		setTicketValue(modelId, NEW_TICKET_ID, (groupByValue === UNSET) ? null : groupByValue);
	};

	if (!filteredItems.length) {
		return (
			<EmptyPageView>
				<FormattedMessage
					id="ticketTable.emptyView"
					defaultMessage="We couldn't find any tickets to show. Please refine your selection."
				/>
			</EmptyPageView>
		);
	}

	if (groupBy === NONE_OPTION || !groupBy) {
		return (
			<ResizableColumnsContextComponent widths={widths}>
				<TicketsTableGroup
					tickets={filteredItems}
					onNewTicket={onGroupNewTicket('')}
					onEditTicket={setTicketValue}
					selectedTicketId={selectedTicketId}
				/>
			</ResizableColumnsContextComponent>
		);
	}

	const groups = groupTickets(groupBy, filteredItems);

	return (
		<ResizableColumnsContextComponent widths={widths}>
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
		</ResizableColumnsContextComponent>
	);
};
