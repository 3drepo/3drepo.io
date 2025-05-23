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

import CalendarIconBase from '@assets/icons/outlined/calendar-outlined.svg';
import { Backdrop as MuiBackdrop } from '@mui/material';
import styled, { css } from 'styled-components';
import { FONT_WEIGHT } from '../../themes/theme';
import { Container as TextOverflowContainer } from '@controls/textOverflow/textOverflow.styles';

export const StopBackgroundInteraction = styled(MuiBackdrop)`
	z-index: 15;
`;

export const DueDateContainer = styled.div`
	font-weight: ${FONT_WEIGHT.MEDIUM};
	height: 20px;
	box-sizing: border-box;
	align-content: center;
`;

export const CalendarIcon = styled(CalendarIconBase)`
	height: 11px;
	width: 11px;
	margin: -1px 2px 0 0;
`;

export const DueStateContainer = styled.span`
	padding-right: 3px;
`;

export const DateContainer = styled.span<{ isOverdue?: boolean; disabled?: boolean }>`
	font-size: 10px;
	user-select: none;
	display: flex;
	gap: 3px;
	height: inherit;
	align-items: center;
	color: ${({ isOverdue, theme }) => isOverdue ? theme.palette.error.main : theme.palette.base.main};

	${TextOverflowContainer} {
		height: unset;
	}

	${({ disabled }) => !disabled && css`
		cursor: pointer;
		&:hover {
			text-decoration: underline;
		}
	`}
`;
