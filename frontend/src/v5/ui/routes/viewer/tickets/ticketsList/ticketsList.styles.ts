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
import styled from 'styled-components';
import { Ticket } from './ticketItem/ticketItem.styles';

export const List = styled.div`
	border: solid 1px ${({ theme }) => theme.palette.base.lightest};
	border-radius: 6px;
	overflow: hidden;
	${/* sc-selector */ Ticket}:not(:last-child) {
		border-bottom: solid 1px ${({ theme }) => theme.palette.base.lightest};
	}
`;

export const Filters = styled.div`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 6px;
	margin-top: -2px;
	margin-bottom: 13px;
`;
