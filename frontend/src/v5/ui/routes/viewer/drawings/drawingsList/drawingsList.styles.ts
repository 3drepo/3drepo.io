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
import { CardList } from '@components/teamspace/teamspaceList/teamspaceList.styles';
import { TableVirtuoso } from 'react-virtuoso';
import styled from 'styled-components';

export const VirtualisedList = styled(TableVirtuoso)`
	height: 100%;
	box-sizing: border-box;
	overflow-x: hidden;

	${/* sc-selector */CardList} {
		width: 100%;
		box-sizing: border-box;
		height: 100%;

		& > * {
			width: 100%;
		}
	}
`;

export const TableRow = styled.div`
	&:not(:last-child) > * {
		border-bottom: solid 1px ${({ theme }) => theme.palette.base.lightest};
	}
`;

export const FillerRow = styled.div<{ height: number }>`
	height: ${({ height }) => height}px;
`;