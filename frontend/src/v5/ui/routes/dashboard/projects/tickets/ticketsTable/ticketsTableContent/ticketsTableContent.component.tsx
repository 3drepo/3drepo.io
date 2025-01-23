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
import { ResizableTableContextComponent, TableElements } from '@controls/resizableTableContext/resizableTableContext';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { Transformers, useSearchParam } from '@/v5/ui/routes/useSearchParam';

type TicketsTableContentProps = {
	setTicketValue: SetTicketValue;
	groupBy: string
	selectedTicketId?: string;
};
export const TicketsTableContent = ({ setTicketValue, selectedTicketId, groupBy }: TicketsTableContentProps) => {
	const { filteredItems } = useContext(SearchContext);
	const { template } = useParams<DashboardTicketsParams>();
	const [modelsIds] = useSearchParam('models', Transformers.STRING_ARRAY);
	
	const showModelName = modelsIds.length > 1;

	const { config, modules } = ProjectsHooksSelectors.selectCurrentProjectTemplateById(template);
	const hasProperties = config?.issueProperties;
	const hasSafetibase = modules?.some((module) => module.type === 'safetibase');
	
	const widths: TableElements[] = [
		{ name: 'id', width: 80, minWidth: 25 },
		{ name: BaseProperties.TITLE, width: 380, minWidth: 25 },
		{ name: 'modelName', width: 145, minWidth: 25, hidden: !showModelName },
		{ name: `properties.${BaseProperties.CREATED_AT}`, width: 127, minWidth: 25 },
		{ name: `properties.${IssueProperties.ASSIGNEES}`, width: 96, minWidth: 25, hidden: !hasProperties }, 
		{ name: `properties.${BaseProperties.OWNER}`, width: 52, minWidth: 25 },
		{ name: `properties.${IssueProperties.DUE_DATE}`, width: 147, minWidth: 25, hidden: !hasProperties },
		{ name: `properties.${IssueProperties.PRIORITY}`, width: 90, minWidth: 25, hidden: !hasProperties },
		{ name: `properties.${BaseProperties.STATUS}`, width: 150, minWidth: 52 },
		{ name: `modules.safetibase.${SafetibaseProperties.LEVEL_OF_RISK}`, width: 137, minWidth: 25, hidden: !hasSafetibase },
		{ name: `modules.safetibase.${SafetibaseProperties.TREATMENT_STATUS}`, width: 134, minWidth: 25, hidden: !hasSafetibase },
	];
	
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
			<ResizableTableContextComponent elements={widths}>
				<TicketsTableGroup
					tickets={filteredItems}
					onNewTicket={onGroupNewTicket('')}
					onEditTicket={setTicketValue}
					selectedTicketId={selectedTicketId}
				/>
			</ResizableTableContextComponent>
		);
	}

	const groups = groupTickets(groupBy, filteredItems);

	return (
		<ResizableTableContextComponent elements={widths}>
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
		</ResizableTableContextComponent>
	);
};
