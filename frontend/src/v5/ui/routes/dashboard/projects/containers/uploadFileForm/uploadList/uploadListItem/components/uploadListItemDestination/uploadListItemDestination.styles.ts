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

import styled from 'styled-components';

import { TextField } from '@material-ui/core';

export const TextInput = styled(TextField)`
	margin: 0;
	width: 271px;
	border: none;
	>.MuiInputBase-root {
		>.MuiInputBase-input {
			font-weight: bold;
		}
		${({ state, theme, error }) => {
		if (error) return '';
		if (state === 'new') {
			return `
					>.MuiInputBase-input { color: ${theme.palette.primary.main}; };
					path { fill: ${theme.palette.primary.main}}
					background-color: ${theme.palette.primary.lightest};
					fieldset { border: none; }
				`;
		}
		if (state === 'existing') {
			return `
					>.MuiInputBase-input { color: ${theme.palette.secondary.main} };
					path { fill: ${theme.palette.secondary.main}}
					background-color: ${theme.palette.tertiary.lightest};
					fieldset { border: none; }
				`;
		}
		return '';
	}}
	}
`;
