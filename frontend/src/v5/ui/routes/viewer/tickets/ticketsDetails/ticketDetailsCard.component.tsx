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

import TicketsIcon from '@mui/icons-material/FormatListBulleted';
import { FormattedMessage } from 'react-intl';
import { CardContainer, CardHeader } from '@/v5/ui/components/viewer/cards/card.styles';
import { Button } from '@mui/material';
import { CardContent } from '../tickets.styles';
import { TicketsTabs } from '../tickets.constants';

export const TicketsDetailsCard = ({ setTabValue, ticket }) => {
	const onClickBack = () => setTabValue(TicketsTabs.List);

	return (
		<CardContainer>
			<CardHeader>
				<TicketsIcon fontSize="small" />
				<FormattedMessage id="viewer.cards.tickets.title" defaultMessage="Tickets" />
				<Button onClick={onClickBack}>Back</Button>
			</CardHeader>
			<CardContent autoHeightMax="100%">
				This is the content of a ticket
				{JSON.stringify(ticket)}
			</CardContent>
		</CardContainer>
	);
};
