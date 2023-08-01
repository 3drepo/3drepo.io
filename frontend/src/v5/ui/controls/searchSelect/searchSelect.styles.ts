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

export const SearchInputContainer = styled.div`
	display: contents;
	margin: 0;
	padding: 0;
`;

export const SearchInput = styled(SearchInputBase).attrs({
	variant: 'outlined',
})`
	margin: -10px 0 0;
	padding: 12px;
	background: ${({ theme }) => theme.palette.primary.contrast};
	z-index: 2;
	position: sticky;
	top: 0;
`;

export const NoResults = styled.div`
	height: 34px;
	display: flex;
	align-items: center;
	padding-left: 12px;
	color: ${({ theme }) => theme.palette.base.main};
	${({ theme }) => theme.typography.body1};
`;
