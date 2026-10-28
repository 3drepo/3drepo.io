/**
 *  Copyright (C) 2026 3D Repo Ltd
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
import styled from 'styled-components';

export const ItemContainer = styled.li<{ selected?: boolean }>`
	width: 1000px;
	height: 80px;

	padding: 0 29px;

	position: relative;
	display: flex;
	align-items: center;
	box-sizing: border-box;
	list-style: none;
	cursor: pointer;

	border-bottom: 1px solid ${({ theme }) => theme.palette.tertiary.lightest};
	background-color: ${({ theme }) => theme.palette.primary.contrast};
`;

export const ChangeValue = styled(TextOverflow)`
	font-weight: bold;
	padding: 0 3px;
`;
