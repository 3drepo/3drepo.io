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

import styled, { css } from 'styled-components';
import { ViewerInputContainer } from '../viewerInputContainer/viewerInputContainer.component';
import { InputLabel } from '@mui/material';
import { isPinLight } from './coordsProperty.helpers';

export const CoordsInputContainer = styled(ViewerInputContainer)`
	padding: 8px 10px 8px 12px;
`;

export const CoordsActions = styled.div`
	display: flex;
	gap: 9px;
`;

export const Label = styled(InputLabel)`
	${({ theme }) => theme.typography.h5};
	padding-bottom: 1px;
	color: inherit;
	max-width: 100%;
	word-wrap: break-word;
	text-overflow: ellipsis;
	display: contents;
`;

export const CoordsAction = styled.div<{ selected?: boolean; disabled?: boolean }>`
	user-select: none;
	outline: 1px solid ${({ theme }) => theme.palette.secondary.lightest};
	border-radius: 20px;
	padding: 5px;
	height: 24px;
	min-width: 24px;
	width: auto;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: center;
	
	${({ theme: { palette }, disabled }) => (disabled ? css`
		color: ${palette.secondary.lightest};
		pointer-events: none;
	` : css`
		color: ${palette.base.main};
		cursor: pointer;
	`)};

	${({ selected }) => selected ? css`
		background-color: ${({ theme }) => theme.palette.primary.main};
		color: ${({ theme }) => theme.palette.primary.contrast};
	` : css`
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		color: ${({ theme }) => theme.palette.base.main};
	`};

	:hover {
		background-color: ${({ selected, theme: { palette } }) => selected ? palette.primary.dark : palette.tertiary.lightest};
	}

	svg {
		height: 14px;
		width: auto;
	}
`;

export const CoordsActionLabel = styled.span`
	${({ theme }) => theme.typography.caption};
	padding: 0 4px;
`;

export const FlexRow = styled.div`
	display: flex;
	flex-flow: row;
`;

export const SelectPinButton = styled.div<{ color: string, isSelected: boolean; disabled: boolean; }>`
	outline: 1px solid;
	outline-color: ${({ color, isSelected, theme }) => isSelected ? color : theme.palette.secondary.lightest};
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	border-radius: 5px;
	margin-left: auto;
	height: 44px;
	box-sizing: border-box;
	padding: 12px;
	cursor: ${({  disabled }) => disabled ? 'default' : 'pointer'};

	${({ color, isSelected, theme }) => isPinLight(color) && css`
		outline-color: ${isSelected ? theme.palette.base.lighter : theme.palette.secondary.lightest};
		> svg path {
			stroke: ${theme.palette.secondary.main};
			stroke-width: 1px;
		}
	`};

	> svg {
		color: ${({ color, theme }) => color || theme.palette.primary.main};
		height: 20px;
		width: auto;
		overflow: visible;
	}
`;
