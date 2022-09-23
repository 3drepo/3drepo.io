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
import styled from 'styled-components';
import { SearchInput as SearchInputBase } from '@controls/search/searchInput';
import MenuItemBase from '@mui/material/MenuItem';
import { FormCheckbox as FormCheckboxBase } from '@controls/formCheckbox/formCheckbox.component';
import { Checkbox } from '@controls/formCheckbox/formCheckbox.styles';

export const FormCheckbox = styled(FormCheckboxBase)`
	width: 100%;
	margin: 0;
	padding: 8px 14px;

	${Checkbox} {
		margin: 0 17px 0 0;
		padding: 0;
	}
`;

export const MenuItem = styled(MenuItemBase)`
	padding: 0;
`;

export const SearchInput = styled(SearchInputBase)`
	margin: 0;
	padding: 4px 12px 12px;
`;

export const NoResults = styled.div`
	padding: 5px 12px 8px;
	color: ${({ theme }) => theme.palette.base.main};
	${({ theme }) => theme.typography.body1};
`;
