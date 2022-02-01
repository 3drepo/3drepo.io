/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { CircleButton } from '@controls/circleButton';
import { TextField } from '@material-ui/core';
import styled from 'styled-components';

export const Input = styled(TextField)`
	margin: 0 7px;
	width: 200px;
	${({ $selectedrow, theme }) => $selectedrow && `
		div { background-color: ${theme.palette.secondary.light} }
		&&& input { color: ${theme.palette.primary.contrast} }
		&& fieldset { border-color: transparent; }
	`}
`;

export const Button = styled(CircleButton)`
	&&&&& {
		:hover { 
				background-color: ${({ $selectedrow, theme }) => ($selectedrow ? theme.palette.secondary.light : theme.palette.secondary.lightest)}
			}
	}
	&& {
		background-color: transparent;
		path { 
			stroke: ${({ $selectedrow, theme }) => ($selectedrow ? theme.palette.primary.contrast : theme.palette.secondary.main)}
		}
	}
`;

export const DeleteButton = styled(Button)`
	&& path {
		stroke: none;
		fill: ${({ $selectedrow, theme }) => ($selectedrow ? theme.palette.primary.contrast : theme.palette.secondary.main)}
	}
`;
