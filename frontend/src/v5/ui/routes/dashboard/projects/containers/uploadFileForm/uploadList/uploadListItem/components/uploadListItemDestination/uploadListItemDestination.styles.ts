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
import { FormTextField } from '@controls/inputs/formInputs.component';
import AutocompleteBase from '@mui/material/Autocomplete';

export const Autocomplete = styled(AutocompleteBase)`
	.MuiFormHelperText-root {
		display: none;
	}
`;

export type NewOrExisting = '' | 'new' | 'existing';
export const DestinationInput = styled(FormTextField)<{ neworexisting: NewOrExisting }>`
	margin: 0;
	border: none;
	border-radius: 6px;
	>.MuiInputBase-root {
		&, &.Mui-focused, &.Mui-error, &.Mui-focused.Mui-error {
			>.MuiInputBase-input {
				font-weight: bold;
				padding: 0;
				&.Mui-disabled { -webkit-text-fill-color: ${({ theme }) => theme.palette.secondary.main}; }
			}
		}
		${({ neworexisting, theme }) => {
		if (neworexisting === 'new') {
			return css`
				>.MuiInputBase-input { color: ${theme.palette.primary.main}; };
				color: ${theme.palette.primary.main};
				background-color: ${theme.palette.primary.lightest};
				fieldset, &:hover fieldset { border: none; }
			`;
		}
		if (neworexisting === 'existing') {
			return css`
				>.MuiInputBase-input { color: ${theme.palette.secondary.main} };
				color: ${theme.palette.secondary.main};
				background-color: ${theme.palette.tertiary.lightest};
				fieldset, &:hover fieldset { border: none; }
			`;
		}
		return '';
	}}
	}
`;
