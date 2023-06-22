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
	InputAdornment as BaseInputAdornment,
	Autocomplete as BaseAutocomplete,
	TextField as TextFieldComponent,
} from '@mui/material';
import { FilterChip } from '@controls/chip/filterChip/filterChip.styles';

export const Autocomplete = styled(BaseAutocomplete)`
	margin: 8px;
`;

export const SearchChip = styled(FilterChip)`
	.MuiChip-root {
		color: ${({ theme }) => theme.palette.primary.main};
		background-color: ${({ theme }) => theme.palette.primary.lightest};
		padding-right: 3px;
	}
`;

export const TextField = styled(TextFieldComponent)<{ multiline: boolean }>`
	margin: 0;
	&.MuiFormControl-root .MuiInputBase-root.MuiAutocomplete-inputRoot {
		padding: 5px 5px 5px 32px;
		gap: 3px;
		${({ multiline }) => multiline && css`
			height: unset;
			min-height: 32px;
		`}
		.MuiInputBase-input {
			height: 1rem;
		}
		.MuiAutocomplete-endAdornment {
			margin: 0 0 0 auto;
			svg {
				color: ${({ theme }) => theme.palette.base.main};
				height: 10px;
				width: 10px;
			}
		}
	}
	.MuiInputBase-root .MuiInputBase-input {
		padding: 0;
		min-width: 55px;
	}
	${SearchChip} + .MuiInputBase-input {
		padding-left: 7px;
		box-sizing: border-box;
	}
	.MuiInputAdornment-root + ${/* sc-selector */ SearchChip} .MuiChip-root, .MuiInputAdornment-root + .MuiInputBase-input {
		margin-left: -3px;
	} 	
`;

export const StartAdornment = styled(BaseInputAdornment).attrs({
	position: 'start',
})`
	margin: 0;
	svg {
		margin: 0 0 0 -21px;
		color: ${({ theme }) => theme.palette.base.main};
	}
`;
