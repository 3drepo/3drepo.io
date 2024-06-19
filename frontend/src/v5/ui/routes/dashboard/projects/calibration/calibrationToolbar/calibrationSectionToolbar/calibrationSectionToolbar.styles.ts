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

import { BaseClearButton } from '@/v5/ui/routes/viewer/toolbar/selectionToolbar/selectionToolbar.styles';
import styled, { css } from 'styled-components';
import PlusIcon from '@assets/icons/viewer/plus.svg';

export const Section = styled.div`
	display: inherit;
`;

export const ClearIcon = styled(PlusIcon)`
	transform: rotate(45deg);
`;

export const ClearButton = styled.div`
	cursor: pointer;
	height: 30px;
	border-radius: 19px;
	align-self: center;
	overflow: hidden;
	display: flex;
	flex-direction: row;
	place-items: center;
	gap: 6px;
	padding: 11px;
	box-sizing: border-box;
	white-space: nowrap;
	transition: all .3s;
	color: ${({ theme }) => theme.palette.primary.lightest};
	background-color: ${({ theme }) => theme.palette.secondary.light};

	&[hidden] {
		width: 0;
		padding: 0;
		margin: 0;
		border: 0;
	}

	&:not([hidden]) {
		width: fit-content;
	}

	&:hover {
		color: ${({ theme }) => theme.palette.primary.main};
	}
`;

export const ClearCalibrationButton = styled(ClearButton)<{ disabled }>`
	background-color: transparent;
	border: solid 1px currentColor;
	margin-left: 11px;

	${({ disabled }) => disabled ? css`
		color: ${({ theme }) => theme.palette.base.main};
		pointer-events: none;
		cursor: default;
	` : css`
		color: ${({ theme }) => theme.palette.primary.contrast};

		&:hover {
			border: none;
			color: ${({ theme }) => theme.palette.secondary.main};
			background-color: ${({ theme }) => theme.palette.primary.contrast};
		}
	`}
`;
