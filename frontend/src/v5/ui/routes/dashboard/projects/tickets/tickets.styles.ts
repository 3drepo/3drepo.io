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
import ListSubheaderBase from '@mui/material/ListSubheader';
import { SearchInput as SearchInputBase } from '@controls/search/searchInput';
import styled from 'styled-components';
import { Drawer } from '@mui/material';

export const InputsContainer = styled.div`
	width: 100%;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
`;

export const ListSubheader = styled(ListSubheaderBase)`
	height: 40px;
	padding: 10px 12px;
	margin: 5px 0 0;
	color: ${({ theme }) => theme.palette.secondary.main};
	${({ theme }) => theme.typography.h3}
`;

export const SelectorsContainer = styled.div`
	display: flex;
	flex-direction: row;
	gap: 5px;

	& > * {
		margin-top: 8px;
		width: 225px;

		&:last-child(3) {
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
`;

export const OpenInViewerButton = styled(Button).attrs({
	variant: 'contained',
	color: 'primary',
})`
	width: 140px;
	height: 28px;
	margin-left: 14px;
`;

export const SidePanel = styled(Drawer).attrs({
	variant: 'persistent',
	anchor: 'right',
	SlideProps: { unmountOnExit: true },
	PaperProps: {
		style: {
			width: 410,
			height: 'calc(100vh - 112px)',
			top: 112,
			zIndex: 0,
		},
	},
})``;

export const SlidePanelHeader = styled.div`
	height: 49px;
	width: 100%;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px solid ${({ theme }) => theme.palette.secondary.lightest};
`;
