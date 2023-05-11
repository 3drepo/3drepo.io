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
import { EllipsisMenuItem as EllipsisMenuItemBase } from '@controls/ellipsisMenu/ellipsisMenuItem';
import { MenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem/ellipsisMenuItem.styles';

export const EllipsisMenuItem = styled(EllipsisMenuItemBase)`
	padding: 5px 12px;
`;

export const EllipsisMenuItemDelete = styled(EllipsisMenuItem)`
	color: ${({ theme }) => theme.palette.error.main};
`;

export const ViewActionMenu = styled.li`
	line-height: 20px;
	font-weight: 500;
	font-size: 12px;
	color: ${({ theme }) => theme.palette.secondary.main};
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	border-radius: 5px;
	display: grid;
	align-items: center;
	grid-template-columns: auto 1fr auto;
	padding-left: 11px;
	box-sizing: border-box;
	height: 36px;
	
	& > svg {
		margin: 0 4px 2px 0;
		width: 13px;
		height: 13px;
	}

	${MenuItem} {
		margin-left: auto;
	}
`;
