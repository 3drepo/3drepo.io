/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { FederationsHooksSelectors, TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { CardContainer, CardContent } from '@components/viewer/cards/card.styles';
import { FormattedMessage } from 'react-intl';
import TicketsIcon from '@assets/icons/outlined/tickets-outlined.svg';

import { EmptyListMessage } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';
import { TicketsList } from './ticketsList.component';
import { NewTicketMenu } from './newTicketMenu/newTicketMenu.component';
import { TicketsActionsDispatchers, TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { formatMessage } from '@/v5/services/intl';
import { CardHeader } from '@components/viewer/cards/cardHeader.component';
import { FilterSelection } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFiltersSelection.component';
import { TicketsEllipsisMenu } from '@components/viewer/cards/tickets/ticketsEllipsisMenu/ticketsEllipsisMenu.component';
import { CardFilters } from '@components/viewer/cards/cardFilters/cardFilters.component';
import { TicketsFiltersContextComponent } from '@components/viewer/cards/cardFilters/ticketsFilters.context';
import { useParams } from 'react-router';
import { ViewerParams } from '../../../routes.constants';
import { useContext, useEffect, useState } from 'react';
import { getState } from '@/v5/helpers/redux.helpers';
import { selectPropertyFetched } from '@/v5/store/tickets/tickets.selectors';
import { GroupBySelection } from '@components/viewer/cards/tickets/groupBySelection/groupBySelection.component';
import { NONE_OPTION } from '@/v5/store/tickets/ticketsGroups.helpers';
import { getPropertyLabel } from '../../../dashboard/projects/tickets/ticketsTable/ticketsTable.helper';
import { BulkCheckbox, GroupByLabelContainer, GroupByLabelText } from './ticketsList.styles';
import { Tooltip } from '@mui/material';
import { TicketsBulkUpdateContext, TicketsBulkUpdateContextComponent } from '@components/tickets/bulkUpdate/bulkUpdate.context';
import { BulkUpdateDropdown } from './bulkUpdate/bulkUpdateDropDown.component';
import { ToggleAllCheckbox } from './bulkUpdate/toggleAllCheckbox.component';
import { TextOverflow } from '@controls/textOverflow';

const TicketsActions = ({ readOnly, groupBy }) => {
	const { toggleBulkMode, bulkModeOn } =  useContext(TicketsBulkUpdateContext);

	const bulkCheckboxTooltipMessage = !bulkModeOn ? 
		formatMessage({ id: 'viewer.cards.tickets.bulkUpdate', defaultMessage: 'Bulk update' }) :
		formatMessage({ id: 'viewer.cards.tickets.disableBulkUpdate', defaultMessage: 'Disable bulk update' });

	return (<>
		{!bulkModeOn && !readOnly && (<NewTicketMenu />)}
		{!readOnly &&  (<Tooltip title={bulkCheckboxTooltipMessage} >
			<BulkCheckbox checked={bulkModeOn} onClick={toggleBulkMode}  />
		</Tooltip>)}
		{bulkModeOn && (
			<BulkUpdateDropdown />
		)}
		{!bulkModeOn && (<FilterSelection />)}
		{!bulkModeOn && (
			<GroupBySelection value={groupBy} onChange={(value) => {
				TicketsCardActionsDispatchers.setSelectedTicket(null);
				TicketsCardActionsDispatchers.setGroupBy(value);
			}} />)}
		{!bulkModeOn && (<TicketsEllipsisMenu />)}
	</>);
};

const GroupByLabel = ({ groupBy }) => {
	const {  bulkModeOn } =  useContext(TicketsBulkUpdateContext);

	return (
		<GroupByLabelContainer >
			<ToggleAllCheckbox />
			<GroupByLabelText $withBulkUpdate={bulkModeOn}>
				<TextOverflow>
					<FormattedMessage id="viewer.cards.tickets.groupedByLabel" defaultMessage="Grouped by: " /> {getPropertyLabel(groupBy)}
				</TextOverflow>
			</GroupByLabelText>
		</GroupByLabelContainer>
	);
};


export const TicketsListCard = () => {
	const { teamspace, project, containerOrFederation } = useParams<ViewerParams>();
	const readOnly = TicketsCardHooksSelectors.selectReadOnly();
	const tickets = TicketsCardHooksSelectors.selectCurrentTickets();
	const templates = TicketsCardHooksSelectors.selectCurrentTemplates();
	const filters = TicketsCardHooksSelectors.selectCardFilters();
	const isFed = FederationsHooksSelectors.selectIsFederation();
	const groupBy = TicketsCardHooksSelectors.selectGroupBy();
	const [fetchingProperties, setFetchingProperties] = useState(false);


	const onFiltersChange = (newfilters) => {
		TicketsCardActionsDispatchers.setFilters(newfilters);
	};

	useEffect(() => {
		if (groupBy === NONE_OPTION) return;

		const alreadyFetched = tickets.every(({ _id }) => selectPropertyFetched(getState(), _id, groupBy));
		
		if (alreadyFetched) return;

		setFetchingProperties(true);

		TicketsActionsDispatchers.fetchTicketsProperties(teamspace,
			project,
			containerOrFederation,
			isFed(containerOrFederation),
			[groupBy],
			() => {
				setFetchingProperties(false);
			},
		);
	}, [groupBy, JSON.stringify(tickets.map(({ _id })=>_id)), setFetchingProperties]);

	return (
		<CardContainer>
			<TicketsBulkUpdateContextComponent>
				<TicketsFiltersContextComponent displayMode='card' templates={templates} modelsIds={[containerOrFederation]} filters={filters} onChange={onFiltersChange}>
					<CardHeader
						icon={<TicketsIcon />}
						title={formatMessage({ id: 'viewer.cards.tickets.title', defaultMessage: 'Tickets' })}
						actions={(<TicketsActions readOnly={readOnly} groupBy={groupBy}/>)}
					/>
					<CardContent onClick={() => TicketsCardActionsDispatchers.setSelectedTicket(null)}>
						<CardFilters />
						{groupBy === NONE_OPTION && <ToggleAllCheckbox $withFilters={filters.length > 0}/>}
						{groupBy !== NONE_OPTION && <GroupByLabel groupBy={groupBy} />}
						{tickets.length ? (
							<TicketsList groupBy={groupBy} templates={templates} loading={fetchingProperties}/>
						) : (
							<EmptyListMessage>
								<FormattedMessage id="viewer.cards.tickets.noTickets" defaultMessage="No tickets have been created yet" />
							</EmptyListMessage>
						)}
					</CardContent>
				</TicketsFiltersContextComponent>
			</TicketsBulkUpdateContextComponent>
		</CardContainer>
	);
};
