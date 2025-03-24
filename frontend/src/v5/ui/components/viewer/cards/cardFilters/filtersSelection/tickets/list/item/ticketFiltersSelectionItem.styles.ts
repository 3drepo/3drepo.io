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

import { TextOverflow } from '@controls/textOverflow';
import { MenuItem as MenuItemBase } from '@mui/material';
import styled from 'styled-components';

export const MenuItem = styled(MenuItemBase)`
	display: flex;
	height: 32px;
	padding-right: 3px;
	width: 100%;
	position: relative;
`;

export const TextOverflowContainer = styled(TextOverflow)`
	width: 100%;
	max-width: 305px;
	height: 32px;
	line-height: 32px;
`;

export const ExpandIconContainer = styled.div`
	transform: rotate(-90deg);
	height: 11px;
	color: ${({ theme }) => theme.palette.base.main};
	position: absolute;
	left: 340px;
`;

export const FilterName = styled.div`
	color: ${({ theme }) => theme.palette.secondary.main};
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`;
