/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { SearchInput as SearchInputBase } from '@controls/searchSelect/searchSelect.styles';
import { MenuItem as MenuItemBase } from '@mui/material';
import styled from 'styled-components';

export const SearchInput = styled(SearchInputBase)`
	margin: 0;
`;

export const MenuItem = styled(MenuItemBase)`
	padding: 0;
	padding-right: 10px;
	max-width: 600px;

	label {
		margin: 0;
		padding: 0;
		width: 100%;
	}

	.MuiFormControlLabel-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 100%;
	}
`;

export const EmptyListMessageContainer = styled.div`
	padding: 0 15px 15px;
`;

