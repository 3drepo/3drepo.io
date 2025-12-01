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
import { SearchSelect } from '@controls/searchSelect/searchSelect.component';
import { MenuItem } from '@mui/material';
import { getTemplatePropertiesDefinitions, groupByProperties } from '@/v5/store/tickets/tickets.helpers';
import { uniq } from 'lodash';
import { getPropertyLabel } from '../../../dashboard/projects/tickets/ticketsTable/ticketsTable.helper';
import { useEffect, useState } from 'react';
import { getState } from '@/v5/helpers/redux.helpers';
import { selectPropertyFetched } from '@/v5/store/tickets/tickets.selectors';

const GroupBySelect = ({ value:valueProp, onChange }) => {
	const templates = TicketsCardHooksSelectors.selectCurrentTemplates();
	const definitions = uniq(templates.flatMap(getTemplatePropertiesDefinitions));
	const items = uniq(groupByProperties(definitions)).map((value) => ({ value, name: getPropertyLabel(value) }))
		.sort((a, b) => {
			const fieldsCountA = a.name.split(':').length;
			const fieldsCountB = b.name.split(':').length;
			
			if (fieldsCountA !== fieldsCountB) {
				return fieldsCountA - fieldsCountB;
			}
			
			return a.name.localeCompare(b.name);
		});

	const onChangeHandler = (e) => {
		onChange(e.target.value);
	};

	return (<SearchSelect value={valueProp} onChange={onChangeHandler}>
		<MenuItem key='none' value='none'>None</MenuItem>
		{(items).map((item) => (
			<MenuItem key={item.value} value={item.value}>
				{item.name}
			</MenuItem>
		))}
	</SearchSelect>);
};

export const TicketsListCard = () => {
	const { teamspace, project } = useParams<ViewerParams>();
	const readOnly = TicketsCardHooksSelectors.selectReadOnly();
	const tickets = TicketsCardHooksSelectors.selectCurrentTickets();
	const templates = TicketsCardHooksSelectors.selectCurrentTemplates();
	const { containerOrFederation } = useParams<ViewerParams>();
	const presetFilters = TicketsCardHooksSelectors.selectCardFilters();
	const isFed = FederationsHooksSelectors.selectIsFederation();
	
	const onFiltersChange = (filters) => {
		TicketsCardActionsDispatchers.setFilters(filters);
	};

	const [groupBy, setGroupby] = useState('none');

	useEffect(() => {
		if (groupBy === 'none') return;

		const alreadyFetched = tickets.every(({ _id }) => selectPropertyFetched(getState(), _id, groupBy));
		
		if (alreadyFetched) return;

		TicketsActionsDispatchers.fetchTicketsProperties(teamspace,
			project,
			containerOrFederation,
			isFed(containerOrFederation),
			[groupBy],
		);
	}, [groupBy, JSON.stringify(tickets.map(({ _id })=>_id))]);

	return (
		<CardContainer>
			<TicketsFiltersContextComponent displayMode='card' templates={templates} modelsIds={[containerOrFederation]} filters={presetFilters} onChange={onFiltersChange}>
				<CardHeader
					icon={<TicketsIcon />}
					title={formatMessage({ id: 'viewer.cards.tickets.title', defaultMessage: 'Tickets' })}
					actions={(
						<>
							{!readOnly && (<NewTicketMenu />)}
							<GroupBySelect value={groupBy} onChange={setGroupby}/>
							<FilterSelection />
							<TicketsEllipsisMenu />
						</>
					)}
				/>
				<CardContent onClick={TicketsCardActionsDispatchers.resetState}>
					<CardFilters />
					{tickets.length ? (
						<TicketsList groupBy={groupBy} templates={templates} />
					) : (
						<EmptyListMessage>
							<FormattedMessage id="viewer.cards.tickets.noTickets" defaultMessage="No tickets have been created yet" />
						</EmptyListMessage>
					)}
				</CardContent>
			</TicketsFiltersContextComponent>
		</CardContainer>
	);
};
