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

import ListSubheaderBase from '@mui/material/ListSubheader';
import styled from 'styled-components';

export const ListSubheader = styled(ListSubheaderBase)`
	height: 40px;
	padding: 10px 12px;
	margin: 5px 0 0;
	color: ${({ theme }) => theme.palette.secondary.main};
	${({ theme }) => theme.typography.h3}
`;
