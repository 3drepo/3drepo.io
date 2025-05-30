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

import { ResizableTableRow } from '@controls/resizableTableContext/resizableTableRow/resizableTableRow.component';
import styled, { css } from 'styled-components';
import { ResizableTable } from '@controls/resizableTableContext/resizableTable/resizableTable.component';
import { Row } from './ticketsTableRow/ticketsTableRow.styles';

export const Headers = styled(ResizableTableRow)`
	gap: 1px;
	width: fit-content;
`;

export const PlaceholderForStickyFunctionality = styled(Headers)``;

export const IconContainer = styled.div<{ $flip?: boolean }>`
	animation: all .2s;
	display: inline-flex;
	margin-right: 5px;

	${({ $flip }) => $flip && css`
		transform: rotate(180deg);
	`}
`;

export const Header = styled.div<{ $selectable?: boolean }>`
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

export const NewTicketRow = styled.div<{ disabled?: boolean }>`
	width: 100%;
	height: 37px;
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

export const NewTicketText = styled.div`
	font-weight: 600;
	${({ theme }) => theme.typography.body1}

	display: flex;
	align-items: center;
	gap: 6px;
	position: sticky;
	left: 15px;
	width: fit-content;
`;

const roundBorderTop = css`
	border-top-left-radius: 10px;
	border-top-right-radius: 10px;
`;

export const Group = styled.div<{ $empty: boolean }>`
	display: grid;
	gap: 1px;
	width: fit-content;
	background-color: transparent;

	${({ $empty }) => !$empty && css`
		& > ${/* sc-selector */Row}:first-child {
			${roundBorderTop}
			overflow: hidden;
		}
	`}

	${NewTicketRow} {
		border-bottom-left-radius: 10px;
		border-bottom-right-radius: 10px;
		${({ $empty }) => $empty && roundBorderTop}
	}
`;

export const Table = styled(ResizableTable)<{ $empty?: boolean }>`
	overflow-x: unset;
	width: fit-content;
	${({ $empty }) => $empty && css`
		${Group} {
			width: unset;
		}
	`}
`;
