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

import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import AddIcon from '@assets/icons/filled/add_circle-filled.svg';
import { sortByName } from '@/v5/store/store.helpers';
import { ActionMenu, MenuItem, NewTicketButton } from '../ticketsList.styles';
import { TicketsCardViews } from '../../tickets.constants';
import { ViewerParams } from '../../../../routes.constants';

export const NewTicketMenu = () => {
	const { containerOrFederation } = useParams<ViewerParams>();
	const templates = TicketsHooksSelectors.selectActiveTemplates(containerOrFederation);

	const goToNewTicket = ({ _id }) => {
		TicketsCardActionsDispatchers.setSelectedTemplate(_id);
		TicketsCardActionsDispatchers.setCardView(TicketsCardViews.New);
	};

	return (
		<ActionMenu
			TriggerButton={(
				<NewTicketButton disabled={!templates?.length}>
					<AddIcon />
					<FormattedMessage id="viewer.cards.tickets.newTicket" defaultMessage="New Ticket" />
				</NewTicketButton>
			)}
		>
			{sortByName(templates).map((template) => (
				<MenuItem onClick={() => goToNewTicket(template)} key={template._id}>
					{template.name}
				</MenuItem>
			))}
		</ActionMenu>
	);
};
