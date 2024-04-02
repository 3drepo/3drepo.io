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

import styled from 'styled-components';
import { Container as ToolbarButtonContainer } from '../../toolbarButton/toolbarButton.styles';

export const ColorIcon = styled.div<{ color: string }>`
	width: 18px;
	height: 18px;
	border-radius: 50%;
	border: solid 1px ${({ theme }) => theme.palette.base.light};
	box-sizing: border-box;
	background-color: ${({ color }) => color};
`;

export const PickerContainer = styled.div`
	margin-bottom: 5px;
	cursor: initial;
	position: relative;
	z-index: 10;
`;

export const ButtonOptionsContainer = styled.div<{ disabled?: boolean; }> `
	position: relative;

	& > ${ /* sc-selector */ToolbarButtonContainer}::after {
		content: '';
		position: absolute;
		height: 0;
		width: 0;
		top: 6px;
		right: 6px;
		border: solid 3px ${({ theme }) => theme.palette.base.main};
		border-left-color: transparent;
		border-bottom-color: transparent;
	}
`;