/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { SearchChip } from '@controls/search/searchInput/searchInput.styles';
import { Autocomplete as BaseAutocomplete } from '@mui/material';
import styled from 'styled-components';

export const Autocomplete = styled(BaseAutocomplete)`
	margin: 8px 0;
	.MuiTextField-root {
		margin: 0;
		&.MuiFormControl-root .MuiInputBase-root.MuiAutocomplete-inputRoot {
			padding: 5px 5px 5px 32px;
			gap: 3px;
			height: unset;
			min-height: 32px;
			
			.MuiInputBase-input {
				height: 1rem;
				padding: 0;
				min-width: 55px;
			}
			.MuiInputAdornment-root {
				margin: 0;
				svg {
					margin: 0 0 0 -21px;
					color: ${({ theme }) => theme.palette.base.main};
				}
			}
			.MuiAutocomplete-endAdornment {
				margin: 0 0 0 auto;
				line-height: initial;
				svg {
					color: ${({ theme }) => theme.palette.base.main};
					height: 10px;
					width: 10px;
				}
			}
			${SearchChip} + .MuiInputBase-input {
				padding-left: 7px;
				box-sizing: border-box;
			}
			.MuiInputAdornment-root + :is(${/* sc-selector */ SearchChip} .MuiChip-root, .MuiInputBase-input) {
				margin-left: -3px;
			}
		}
	}
`;