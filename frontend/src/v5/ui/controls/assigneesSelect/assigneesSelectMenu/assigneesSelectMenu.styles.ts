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

import { FONT_WEIGHT } from '@/v5/ui/themes/theme';
import { Select } from '@controls/inputs/select/select.component';
import { SearchInput as SearchInputBase } from '@controls/search/searchInput';
import { Divider } from '@mui/material';
import styled from 'styled-components';

export const HiddenSelect = styled(Select)`
	height: 0;
	width: 0;
	overflow: hidden;
	position: absolute;
	right: 0;
	top: 0;
`;

export const ListHeading = styled.div`
	${({ theme }) => theme.typography.h5};
	color: ${({ theme }) => theme.palette.base.main};
	padding: 4px 14px;
	font-weight: ${FONT_WEIGHT.BOLD};
`;

export const SearchInput = styled(SearchInputBase)`
	width: auto;
	margin: 2px 12px 12px;
`;

export const HorizontalRule = styled(Divider)`
	margin: 10px 0;
`;
