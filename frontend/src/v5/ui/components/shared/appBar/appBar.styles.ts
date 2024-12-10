/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { AppBar } from '@mui/material';
import styled from 'styled-components';
import LogoIconBase from '@assets/icons/filled/logo-filled.svg';

export const LogoIcon = styled(LogoIconBase)`
	color: ${({ theme }) => theme.palette.primary.contrast};
`;

export const Items = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	max-width: calc(100% - 200px);
	margin-left: 5px;
	
	&:last-child {
		justify-content: flex-end;
		min-width: 152px;
	}
	&:first-child {
		justify-content: left;
	}
`;

export const AppBarContainer = styled(AppBar).attrs({
	position: 'static',
})`
	@media print {
		display: none;
	}
`;
