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

export const PinInputContainer = styled(ViewerInputContainer)`
	padding: 8px 10px 8px 12px;
`;

export const PinActions = styled.div`
	display: flex;
	gap: 9px;
`;

export const PinName = styled.div<{ required: boolean }>`
	${({ theme }) => theme.typography.h5};
	position: relative;
	top: -1px;
	padding-bottom: 1px;
	user-select: none;
	
	${({ required }) => required && css`
	&::after {
		font-weight: 400;
		font-size: 0.75rem;
		color: ${({ theme }) => theme.palette.error.main};
		margin-left: 2px;
		content: '*';
	}
	`}
`;

const activeActionStyle = css`
	background-color: ${({ theme }) => theme.palette.primary.main};
	color: ${({ theme }) => theme.palette.primary.contrast};
`;
const passiveActionStyle = css`
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	color: ${({ theme }) => theme.palette.base.main};
`;

export const PinAction = styled.div<{ selected?: boolean; disabled?: boolean }>`
	user-select: none;

	outline: 1px solid ${({ theme }) => theme.palette.secondary.lightest};
	border-radius: 20px;
	padding: 5px 5px 4px;
	height: 15px;
	display: flex;
	align-items: center;
	
	${({ theme: { palette }, disabled }) => (disabled ? css`
		color: ${palette.secondary.lightest};
		pointer-events: none;
	` : css`
		color: ${palette.base.main};
		cursor: pointer;
	`)};

	${({ selected }) => selected ? activeActionStyle : passiveActionStyle};
	:hover {
		${({ selected }) => selected ? passiveActionStyle : activeActionStyle};
	}
	svg {
		height: 14px;
		width: auto;
	}
`;

export const PinActionLabel = styled.span`
	${({ theme }) => theme.typography.caption};
	padding: 0 4px;
`;

export const FlexRow = styled.div`
	display: flex;
	flex-flow: row;
`;

export const PinSelectContainer = styled.div<{ color: string, isSelected: boolean; $isLight: boolean; disabled: boolean; }>`
	outline: 1px solid;
	outline-color: ${({ color, isSelected, theme }) => isSelected ? color : theme.palette.secondary.lightest};
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	border-radius: 5px;
	margin-left: auto;
	height: 44px;
	box-sizing: border-box;
	padding: 12px;
	cursor: ${({  disabled }) => disabled ? 'default' : 'pointer'};

	${({ $isLight, isSelected, theme }) => $isLight && css`
		outline-color: ${isSelected ? theme.palette.base.lighter : theme.palette.secondary.lightest};
		> svg path {
			stroke: ${theme.palette.secondary.main};
			stroke-width: 1px;
			stroke-dasharray: 2,2;
			stroke-linejoin: round;
		}
	`};

	> svg {
		color: ${({ color, theme }) => color || theme.palette.primary.main};
		height: 20px;
		width: auto;
	}
`;
