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
import { SafetibaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { TicketsTableGroup } from './ticketsTableGroup/ticketsTableGroup.component';
import { GROUP_BY_URL_PARAM_TO_TEMPLATE_CASE, groupTickets, ISSUE_PROPERTIES_GROUPS, NONE_OPTION, SAFETIBASE_PROPERTIES_GROUPS, UNSET } from '../ticketsTable.helper';
import { EmptyTicketsView } from '../../emptyTicketsView/emptyTicketsView.styles';
import { Container } from './ticketsTableContent.styles';

type TicketsTableContentProps = { setSidePanelData: (modelId: string, ticket?: Partial<ITicket>) => void; };
export const TicketsTableContent = ({ setSidePanelData }: TicketsTableContentProps) => {
	const { filteredItems } = useContext(SearchContext);
	const { groupBy: groupByAsURLParam, template } = useParams<DashboardTicketsParams>();
	const groupBy = GROUP_BY_URL_PARAM_TO_TEMPLATE_CASE[groupByAsURLParam];

	const onGroupNewTicket = (groupByValue: string) => (modelId: string) => {
		if (groupByValue === UNSET) {
			setSidePanelData(modelId, {});
			return;
		}

		const defaultValue = {} as any;
		const formattedGroupByValue = _.upperCase(groupByValue).replaceAll(' ', '_');

		if (groupBy === SafetibaseProperties.TREATMENT_STATUS) {
			defaultValue.modules = {
				safetibase: {
					[groupBy]: SAFETIBASE_PROPERTIES_GROUPS[groupBy][formattedGroupByValue],
				},
			};
		}

		if (groupBy in ISSUE_PROPERTIES_GROUPS) {
			defaultValue.properties = {
				[groupBy]: ISSUE_PROPERTIES_GROUPS[groupBy][formattedGroupByValue],
			};
		}

		setSidePanelData(modelId, defaultValue);
	};

	if (!filteredItems.length) {
		return (
			<EmptyTicketsView>
				<FormattedMessage
					id="ticketTable.emptyView"
					defaultMessage="We couldn't find any tickets to show. Please refine your selection."
				/>
			</EmptyTicketsView>
		);
	}

	if (groupBy === NONE_OPTION) return (<TicketsTableGroup ticketsWithModelId={filteredItems} onNewTicket={onGroupNewTicket('')} onEditTicket={setSidePanelData} />);

	const groups = groupTickets(groupBy, filteredItems);

	return (
		<Container>
			{_.entries(groups).map(([groupName, ticketsWithModelId]) => (
				<DashboardListCollapse
					title={<>{groupName} <CircledNumber disabled={!ticketsWithModelId.length}>{ticketsWithModelId.length}</CircledNumber></>}
					defaultExpanded={!!ticketsWithModelId.length}
					key={groupBy + groupName + template + ticketsWithModelId}
				>
					<TicketsTableGroup ticketsWithModelId={ticketsWithModelId} onNewTicket={onGroupNewTicket(groupName)} onEditTicket={setSidePanelData} />
				</DashboardListCollapse>
			))}
		</Container>
	);
};
