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

import styled from 'styled-components';
import { CircleButton } from '@controls/circleButton';

export const SidebarContainer = styled.span<{ open: boolean }>`
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	position: relative;
	width: ${({ open }) => (open ? '400px' : '0')};
	transition: width 0.1s;
	overflow: auto;
	flex-shrink: 0;
`;

export const SidebarContent = styled.div`
	padding: 30px;
	width: 100%;
	box-sizing: border-box;
`;

export const ExpandButton = styled(CircleButton)`
	position: absolute;
	right: 11px;
	top: 14px;
	z-index: 1;
`;
