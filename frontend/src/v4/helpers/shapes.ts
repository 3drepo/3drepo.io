/**
 *  Copyright (C) 2021 3D Repo Ltd
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

export const shouldDisplayShapes = (ticket, sequence?, min?, max?) => {
	let ticketHasShapes = Boolean(ticket.shapes?.length);

	if (sequence) {
		if (ticket.sequence_start) {
			ticketHasShapes = ticketHasShapes && ticket.sequence_start <= max;
		}

		if (ticket.sequence_end) {
			ticketHasShapes = ticketHasShapes && ticket.sequence_end >= min;
		}
	}

	return ticketHasShapes;
};

export const chopShapesUuids = ({shapes, ...ticket}) => {
	if (shapes) {
		ticket = { shapes: shapes.map(({uuid, _id, ...rest}) => rest), ...ticket};
	}

	return ticket;
};

export const setShapesUuids = (shapes) => shapes.map(({uuid, _id, ...rest}) => ({ uuid: _id || uuid, ...rest }));

export const getTicketsShapes =
	(tickets, activeTicket: any, showDetails, selectedSequence, sequenceStartDate, sequenceEndDate, enabled) => {

	if (!enabled) {
		return [];
	}

	if (!selectedSequence) {
		return (activeTicket.shapes || []);
	}

	const shapes =  tickets.reduce((accumShapes, ticket) => {
		if (shouldDisplayShapes(ticket, selectedSequence, sequenceStartDate, sequenceEndDate)
			|| (ticket._id === activeTicket._id  && showDetails)) {
			// eslint-disable-next-line prefer-spread
			accumShapes.push.apply(accumShapes, ticket.shapes);
		}

		return accumShapes;
	} , []);

	// If it is a new ticket is not in the ticket list , so I have to add it manually
	if (!activeTicket._id && showDetails) {
		// eslint-disable-next-line prefer-spread
		shapes.push.apply(shapes, activeTicket.shapes || []);
	}

	return shapes;
};

export const getHighlightedTicketShapes = (activeTicket, sequence, shapesBeingShowed, showDetails) => {
	if (!sequence || showDetails) {
		return [];
	}

	const shapesSet = new Set(shapesBeingShowed);
	return (activeTicket.shapes || []).filter((shape) => shapesSet.has(shape));
};
