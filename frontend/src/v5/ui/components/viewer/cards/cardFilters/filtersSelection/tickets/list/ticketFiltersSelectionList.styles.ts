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

import { MenuList as MenuListBase } from '@mui/material';
import { EmptyListMessage as EmptyListMessageBase } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';
import styled from 'styled-components';

export const MenuList = styled(MenuListBase)`
	box-shadow: none !important;
	padding: 0;
	overflow-x: hidden;
	border-radius: 0;
`;

export const EmptyListMessage = styled(EmptyListMessageBase)`
	margin: 0 10px 10px;
`;

export const SearchWord = styled.b`
	max-width: 365px;
	word-break: break-word;
`;