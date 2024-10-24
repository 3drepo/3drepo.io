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
import { Link } from 'react-router-dom';
import { Items as ItemsBase } from '@components/shared/appBar/appBar.styles';

export const NavLinks = styled.div`
	margin: 0 13px;
	color: ${({ theme }) => theme.palette.base.light};
`;

export const NavLink = styled(Link)<{ selected?: boolean }>`
	margin: 0 12px;
	${({ theme }) => theme.typography.h5}
	cursor: pointer;
	display: inline-block;
	white-space: nowrap;
	color: ${({ theme: { palette }, selected }) => (selected ? palette.primary.main : palette.base.light)};
`;

export const Items = styled(ItemsBase)`
	max-width: unset;

	&:last-child {
		min-width: unset;
	}
`;
