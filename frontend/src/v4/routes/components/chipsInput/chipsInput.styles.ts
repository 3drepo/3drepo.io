/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { Autocomplete } from '@mui/material';

export const StyledChipInput = styled(Autocomplete)`
	&& {
		margin-top: 10px;
		padding-right: 0;
		
		& .MuiAutocomplete-tag {
			height: 24px;
			margin: 4px 8px 4px 0;

			& span {
				padding-left: 8px;
				padding-right: 8px;
			}
		}

		& svg {
			width: 16px;
			height: 16px;
			margin-left: -4px;
			margin-right: 4px;
		}
	}
`;