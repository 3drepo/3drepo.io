/**
 *  Copyright (C) 2025 3D Repo Ltd
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
import TicketPin from '@assets/icons/filled/pin_ticket-filled.svg';
import IssuePin from '@assets/icons/filled/pin_issue-filled.svg';
import RiskPin from '@assets/icons/filled/pin_risk-filled.svg';
import MarkerPin from '@assets/icons/filled/pin_marker-filled.svg';
import { PinIcon } from '@/v5/store/tickets/tickets.types';


const PinPerType = 
{
	'ISSUE': IssuePin,
	'RISK': RiskPin,
	'DEFAULT': TicketPin,
	'MARKER': MarkerPin,
};


export const Pin = ({ type }: { type:PinIcon }) => {
	const Icon = PinPerType[type];
	return (<Icon />);
};