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

import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { formatMessage } from '@/v5/services/intl';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { ArrowBack, CardContainer, CardHeader } from '@components/viewer/cards/card.styles';
import { FormattedMessage } from 'react-intl';
import AddCircleIcon from '@assets/icons/outlined/add_circle-outlined.svg';
import { MOCK_DATA } from '@/v5/store/tickets/groups/ticketGroups.helpers';
import { CardContent, NewGroupButton } from './ticketGroups.styles';
import { TicketsCardViews } from '../tickets.constants';
import { GroupsAccordion } from './groupsAccordion/groupsAccordion.component';

export const TicketGroups = () => {
	const ticket = TicketsCardHooksSelectors.selectSelectedTicket();
	const groups = MOCK_DATA;

	return (
		// <CardContainer>
		// 	<CardHeader>
		// 		<ArrowBack onClick={() => TicketsCardActionsDispatchers.setCardView(TicketsCardViews.Details)} />
		// 		{ticket.title}: <FormattedMessage id="ticketCard.groups" defaultMessage="Groups" />
		// 	</CardHeader>
		// 	<CardContent>
		<>
			<GroupsAccordion
				title={formatMessage({ id: 'ticketCard.groups.coloured', defaultMessage: 'Coloured Groups' })}
				groups={groups.colored}
				colored
			>
				<NewGroupButton startIcon={<AddCircleIcon />}>
					<FormattedMessage
						id="ticketCard.groups.addGroup"
						defaultMessage="Add group"
					/>
				</NewGroupButton>
			</GroupsAccordion>
			<GroupsAccordion
				title={formatMessage({ id: 'ticketCard.groups.hidden', defaultMessage: 'Hidden Groups' })}
				groups={groups.hidden}
			>
				<NewGroupButton startIcon={<AddCircleIcon />}>
					<FormattedMessage
						id="ticketCard.groups.addGroup"
						defaultMessage="Add group"
					/>
				</NewGroupButton>
			</GroupsAccordion>
		</>
		// 	</CardContent>
		// </CardContainer>
	);
};
