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

import styled, { css } from 'styled-components';

export const NEW_TICKET_ROW_HEIGHT = '37px';
export const NewTicketRow = styled.div<{ disabled?: boolean }>`
	width: 100%;
	height: ${NEW_TICKET_ROW_HEIGHT};
	cursor: pointer;
	color: ${({ theme }) => theme.palette.base.main};
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	display: grid;
	position: relative;
	z-index: 11;

	${({ disabled }) => disabled && css`
		cursor: initial;
		pointer-events: none;
		color: ${({ theme }) => theme.palette.base.light};
	`}
`;

export const NewTicketTextContainer = styled.div`
	position: sticky;
	margin-left: 15px;
	left: 15px;
	max-width: calc(100% - 15px);
	width: fit-content;
	overflow: hidden;
	display: flex;
	align-items: center;
	gap: 6px;

	svg {
		min-width: 15px;
	}
`;

export const NewTicketText = styled.span`
	font-weight: 600;
	${({ theme }) => theme.typography.body1}
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	width: 100%;
`;