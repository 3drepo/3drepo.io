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
import styled, { css } from 'styled-components';
import {
	IconButton as IconButtonComponent,
	TextField as TextFieldComponent,
	InputAdornment as InputAdornmentComponent,
} from '@material-ui/core';

export const IconButton = styled(IconButtonComponent)`
	padding: 6px;
`;

export const TextField = styled(TextFieldComponent)`
	margin: 0 0 0 14px;

	input {
		padding-left: 10px;
	}

	.MuiOutlinedInput-adornedEnd {
		padding-right: 0;
	}

	.MuiOutlinedInput-root {
		margin: 0;
	}
`;

export const StartAdornment = styled(InputAdornmentComponent).attrs({
	position: 'start',
})`
	margin-right: 0;
`;

export const EndAdornment = styled(InputAdornmentComponent).attrs({
	position: 'end',
})`
	${({ $isVisible }) => !$isVisible && css`
		visibility: hidden;
	`}
`;
