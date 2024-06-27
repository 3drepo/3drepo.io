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
import { TextField } from '@controls/inputs/textField/textField.component';
import AutocompleteBase from '@mui/material/Autocomplete';

export const DestinationAutocomplete = styled(AutocompleteBase)`
	.MuiFormHelperText-root {
		display: none;
	}

	pointer-events: ${(props: any) => props.disabled ? 'none' : 'all'};
`;

export type NewOrExisting = '' | 'new' | 'existing';
export const DestinationInput = styled(TextField)<{ neworexisting: NewOrExisting }>`
	margin: 0;
	border: none;
	border-radius: 8px;
	
	& > .MuiInputBase-root {
		&, &.Mui-focused, &.Mui-error, &.Mui-focused.Mui-error {
			& > .MuiInputBase-input {
				font-weight: bold;
				padding: 0;

				&.Mui-disabled {
					-webkit-text-fill-color: ${({ theme }) => theme.palette.secondary.main};
				}
			}
			fieldset {
				height: 36px;
			}
		}
		${({ neworexisting, theme }) => neworexisting === 'new' && css`
			color: ${theme.palette.primary.main};
			background-color: ${theme.palette.primary.lightest};

			& > .MuiInputBase-input {
				color: ${theme.palette.primary.main};
			}

			fieldset, &:hover fieldset {
				border: none;
			}
		`}

		${({ neworexisting, theme }) => neworexisting === 'existing' && css`
			color: ${theme.palette.secondary.main};
			background-color: ${theme.palette.tertiary.lightest};

			& > .MuiInputBase-input {
				color: ${theme.palette.secondary.main};
			}

			fieldset, &:hover fieldset {
				border: none;
			}
		`}
	}
`;

export const OptionsBox = styled.div`
	padding: 0;
	${({ theme }) => theme.typography.body1};
	font-weight: 500;
	max-height: 350px;
`;
