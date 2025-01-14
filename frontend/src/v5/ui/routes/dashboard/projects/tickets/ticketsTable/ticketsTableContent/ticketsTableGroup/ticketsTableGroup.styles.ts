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

import { ResizableColumnsNonResizableItem } from '@controls/resizableColumnsContext/resizableColumnsNonResizableItem/resizableColumnsNonResizableItem.styles';
import { ResizableColumnsRow } from '@controls/resizableColumnsContext/resizableColumnsRow/resizableColumnsRow.styles';
import { Typography } from '@controls/typography';
import styled, { css } from 'styled-components';

export const Headers = styled(ResizableColumnsRow)`
	gap: 1px;
	width: fit-content;
`;

export const IconContainer = styled.div<{ $flip?: boolean }>`
	animation: all .2s;
	display: inline-flex;
	margin-right: 5px;

	${({ $flip }) => $flip && css`
		transform: rotate(180deg);
	`}
`;

export const Header = styled.div<{ $selectable: boolean }>`
	${({ theme }) => theme.typography.kicker};
	color: ${({ theme }) => theme.palette.base.main};
	padding-left: 10px;
	padding-bottom: 10px;
	text-align: start;
	box-sizing: border-box;
	user-select: none;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;

	${({ $selectable }) => $selectable && css`
		cursor: pointer;
	`}
`;

export const Group = styled.div`
	display: grid;
	border-radius: 10px;
	overflow: hidden;
	gap: 1px;
	width: fit-content;
	background-color: transparent;
`;

export const NewTicketRow = styled(ResizableColumnsNonResizableItem)<{ disabled?: boolean }>`
	width: 100%;
	height: 37px;
	font-weight: 600;
	cursor: pointer;
	color: ${({ theme }) => theme.palette.base.main};
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	display: flex;
	align-items: center;
	padding-left: 15px;
	gap: 6px;

	${({ disabled }) => disabled && css`
		cursor: initial;
		pointer-events: none;
		color: ${({ theme }) => theme.palette.base.light};
	`}
`;

export const NewTicketText = styled(Typography).attrs({
	variant: 'body1',
})`
	font-weight: 600;
`;
