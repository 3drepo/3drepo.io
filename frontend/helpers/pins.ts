/**
 *  Copyright (C) 2019 3D Repo Ltd
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
import { isEqual } from 'lodash';
import { getIssuePinColor } from './issues';
import { getRiskPinColor } from './risks';

const pinsById = (pins) => pins.reduce((map, pin) =>  { map[pin.id] = pin; return map; } , {});

export const pinsDiff = (pinsA: any[], pinsB: any[]): any[] => {
	const pinsMap = pinsById(pinsB);

	return pinsA.reduce( (diffPins, pin) => {
		if (!isEqual(pin, pinsMap[pin.id])) {
			diffPins.push(pin);
		}
		return diffPins;
	}, []);
};

export const hasPin = (ticket, sequence?, min?, max?) => {
	let validPin = ticket.position && ticket.position.length === 3;

	if (sequence) {
		if (ticket.sequence_start) {
			validPin = validPin && ticket.sequence_start <= max;
		}

		if (ticket.sequence_end) {
			validPin = validPin && ticket.sequence_end >= min;
		}
	}

	return validPin;
};

export const ticketToPin = (ticket, type, isSelected, color) =>
	({
		id: ticket._id || 'newPin',
		type,
		isSelected,
		account: ticket.account,
		model: ticket.model,
		position: ticket.position,
		colour: color,
		viewpoint: ticket.viewpoint
	});

export const issueToPin = (issue, isSelectedPin ) =>
	ticketToPin(issue, 'issue', isSelectedPin, getIssuePinColor(issue));

export const riskToPin = (risk, isSelectedPin ) =>
	ticketToPin(risk, 'risk', isSelectedPin, getRiskPinColor(risk));
