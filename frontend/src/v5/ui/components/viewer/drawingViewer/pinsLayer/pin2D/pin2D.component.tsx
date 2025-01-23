/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { IPin } from '@/v4/services/viewer/viewer';
import PinIcon from '@assets/icons/filled/ticket_pin-filled.svg';
import { PinContainer } from './pin2D.styles';
import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { useParams } from 'react-router';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';

type Pin2DProps = IPin & { scale: number };
export const Pin2D = ({ id, isSelected, position, colour, scale }: Pin2DProps) => {
	const { containerOrFederation } = useParams<ViewerParams>();
	const tickets = TicketsHooksSelectors.selectTickets(containerOrFederation);

	const handleClick = (e) => {
		e.stopPropagation();
		TicketsCardActionsDispatchers.setSelectedTicketPin(id);
		if (!tickets.some((t) => t._id === id)) return;
		
		TicketsCardActionsDispatchers.openTicket(id);
	};

	return (
		<PinContainer
			colour={colour}
			onClick={handleClick}
			selected={isSelected}
			style={{ transform: `translate(${position[0]}px, ${position[1]}px) scale(${0.333 / scale})` }}
		>
			<PinIcon />
		</PinContainer>
	);
};
