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
import { Typography } from '@mui/material';
import { CardListItem } from '@components/shared/linkCard/linkCard.styles';
import { Button } from '@controls/button';
import { SearchInput as SearchInputBase } from '@controls/search/searchInput';

export const Header = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	min-height: 51px;
	margin-bottom: 16px;
`;

export const Title = styled(Typography).attrs({
	variant: 'h2',
})`
	color: ${({ theme }) => theme.palette.secondary.main};
`;

export const ActionComponents = styled.div`
	display: flex;
	flex-direction: row;
`;

export const NewProjectButton = styled(Button).attrs({
	color: 'primary',
	variant: 'contained',
})`
	width: 124px;
	margin-right: 0;
`;

export const SearchInput = styled(SearchInputBase)`
	width: 345px;
`;

export const ProjectCardsList = styled.ul`
	display: flex;
	flex-direction: row;
	justify-content: center;
	flex-wrap: wrap;
	padding: 0;
	margin: 0;
	gap: 20px;

	${CardListItem} {
		margin: 0;
	}
`;
