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

import styled, { css } from 'styled-components';
import { ToolbarButton } from './toolbarButton.component';

export const FloatingButtonsContainer = styled.div`
	display: flex;
	flex-direction: column;
	position: absolute;
	bottom: 44px;
	z-index: 10;
`;

const floatingElementStyles = css`
	box-shadow: ${({ theme }) => theme.palette.shadows.level_5};
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	margin-bottom: 5px;
	box-sizing: border-box;
	border: solid 1px ${({ theme }) => theme.palette.secondary.lightest};
`;

export const FloatingBar = styled.div`
	${floatingElementStyles}
	border-radius: 20px;
	width: 40px;
	display: flex;
	flex-direction: column;
	padding: 10px 0;
	cursor: inherit;
`;

export const FloatingBarItem = styled.div<{ selected?: boolean }>`
	cursor: pointer;
	width: 100%;
	height: 19px;
	font-weight: 500;
	color: ${({ theme, selected }) => selected ? theme.palette.primary.main : theme.palette.secondary.main};
	display: grid;
	place-content: center;

	&:hover {
		color: ${({ theme }) => theme.palette.primary.main};
	}
`;

export const FloatingButton = styled(ToolbarButton).attrs({
	tooltipProps: {
		placement: 'right',
	},
})`
	${floatingElementStyles}
	border-radius: 50%;
	cursor: pointer;
`;
