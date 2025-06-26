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
import { Button } from '@controls/button';
import { SearchInput as SearchInputBase } from '@controls/search/searchInput';
import styled, { css } from 'styled-components';
import { FilterChip } from '@controls/chip/filterChip/filterChip.styles';

export const FiltersContainer = styled.div`
	width: 100%;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: flex-end;
	margin-bottom: 18px;
`;

export const FlexContainer = styled.div`
	display: flex;
	flex-direction: row;
`;

export const SelectorsContainer = styled(FlexContainer)`
	gap: 5px;

	& > * {
		width: 225px;
		margin: 8px 0;

		&:last-child() {
			width: 205px;
		}
	}
`;

export const SearchInput = styled(SearchInputBase)`
	width: 244px;
`;

export const NewTicketButton = styled(Button).attrs({
	variant: 'contained',
	color: 'primary',
})`
	width: 119px;
	margin-right: 0;
`;

export const CompletedChip = styled(FilterChip).attrs(({ selected, theme }: any) => ({
	color: theme.palette.success.main,
	variant: selected ? 'filled' : 'outlined',
}))<{ selected: boolean }>`
	.MuiChip-root {
		align-self: flex-end;
		margin: 0 0 18px 15px;

		&, &:hover {
			color: ${({ theme }) => theme.palette.success.main};
			border: 1px solid ${({ theme }) => theme.palette.success.main};
			${({ selected, theme: { palette } }) => selected && css`
				color: ${palette.primary.contrast};
				background-color: ${palette.success.main};
			`}
		}
	}
`;
