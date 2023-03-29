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

import { Avatar } from '@controls/avatar';
import styled, { css } from 'styled-components';

export const BaseCircle = css`
	margin: 0 -8px 0 0;
	color: ${({ theme }) => theme.palette.primary.main};
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	height: 28px;
	width: 28px;
	pointer-events: auto;
	
	.MuiAvatar-root {
		border: 2px solid ${({ theme }) => theme.palette.primary.contrast};
		box-sizing: border-box;
		height: 100%;
		width: 100%;
		font-size: 10px;
	}
`;

export const UserCircle = styled(Avatar)`
	${BaseCircle}
	.MuiAvatar-root {
		background-color: ${({ theme }) => theme.palette.base.lightest};
		color: ${({ theme }) => theme.palette.secondary.main};
	}
`;
