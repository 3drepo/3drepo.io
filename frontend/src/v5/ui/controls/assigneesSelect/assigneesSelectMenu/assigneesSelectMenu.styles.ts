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

import { Select } from '@controls/inputs/select/select.component';
import { SearchInput as SearchInputBase } from '@controls/search/searchInput';
import { Divider } from '@mui/material';
import styled from 'styled-components';

export const HiddenSelect = styled(Select).attrs({
	MenuProps: {
		disableAutoFocusItem: true,
		PaperProps: {
			style: {
				maxHeight: 400,
				width: 218,
			},
		},
		anchorOrigin: {
			vertical: 'top',
			horizontal: 'left',
		},
		transformOrigin: {
			vertical: 'top',
			horizontal: 'left',
		},
	},
})`
	height: 0;
	width: 0;
	overflow: hidden;
	position: absolute;
	top: 24px;
`;

export const SearchInput = styled(SearchInputBase).attrs({
	variant: 'outlined',
})`
	margin: -10px 0 0;
	padding: 12px;
	top: 0;
	position: sticky;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	z-index: 1;
`;

export const HorizontalRule = styled(Divider)`
	margin: 10px 0;
`;
