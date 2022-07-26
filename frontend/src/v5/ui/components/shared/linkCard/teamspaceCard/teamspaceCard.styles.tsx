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
import { Avatar } from '@controls/avatar';

export const TeamspaceImage = styled(Avatar)`
	width: 100%;
	margin: 0;
	
	.MuiAvatar-root {
		cursor: pointer;
		border-radius: 0;
		width: 100%;
		height: 175px;
		margin: 0;
		font-size: 40px;
		color: ${({ theme }) => theme.palette.tertiary.dark};
		background-color: ${({ theme }) => theme.palette.primary.contrast};
	}
`;
