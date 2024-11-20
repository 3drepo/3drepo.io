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

import { ActionMenu as ActionMenuBase } from '@controls/actionMenu';
import { SearchInput as SearchInputBase } from '@controls/search/searchInput';

import styled from 'styled-components';

export const SearchInput = styled(SearchInputBase)`
	margin: 0;
	padding: 10px;

	.MuiInputBase-root {
		border: solid 1px ${({ theme }) => theme.palette.base.lightest};

		&, &:hover {
			background-color: transparent;
		}

		input {
			padding-right: 0;
		}

		.MuiInputAdornment-positionEnd {
			margin: 0;
		}
	}
`;

export const ActionMenu = styled(ActionMenuBase)`
	.MuiPaper-root {
		left: 88px !important;
		width: 365px;
	}
`;