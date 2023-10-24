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

import { Container as FixedOrGrowContainer } from '@controls/fixedOrGrowContainer/fixedOrGrowContainer.styles';
import { Typography } from '@controls/typography';
import styled, { css } from 'styled-components';

export const Headers = styled.div`
	display: flex;
	gap: 1px;
	margin-bottom: 10px;
	width: 100%;
	width: min(90vw, 1289px);
`;

export const IconContainer = styled.div<{ $flip?: boolean, $hidden: boolean }>`
	animation: all .2s;

	svg {
		margin-bottom: -1px;
	}

	${({ $flip }) => $flip && css`
		transform: rotate(180deg);
	`}

	${({ $hidden }) => $hidden && css`
		display: none;
	`}
`;

export const Header = styled(FixedOrGrowContainer)<{ hidden?: boolean, $selected: boolean, $selectable: boolean }>`
	${({ theme }) => theme.typography.kicker};
	color: ${({ theme }) => theme.palette.base.main};
	display: flex;
	flex-direction: row;
	padding-left: 10px;
	text-align: start;
	box-sizing: border-box;
	user-select: none;

	${({ $selected }) => $selected && css`
		gap: 5px;
	`}

	${({ $selectable }) => $selectable && css`
		cursor: pointer;
	`}

	${({ width }) => width ? css`
		flex: 0 0 ${width};
	` : css`
		flex: 1;
		min-width: 300px;
	`}

	${({ hidden }) => hidden && css`
		display: none;
	`}
`;

export const Group = styled.div`
	display: grid;
	border-radius: 10px;
	overflow: hidden;
	gap: 1px;
	background-color: transparent;
`;

export const NewTicketRow = styled.div<{ disabled?: boolean }>`
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
