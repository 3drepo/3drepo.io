/**
 *  Copyright (C) 2018 3D Repo Ltd
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

import ListSubheader from '@material-ui/core/ListSubheader';
import Toolbar from '@material-ui/core/Toolbar';
import styled from 'styled-components';

export const StyledToolbar = styled(Toolbar)`
	&& {
		display: flex;
		align-items: center;
		justify-content: space-between;
		overflow: hidden;
	}
`;

export const ListSubheaderContainer = styled(ListSubheader)`
	&& {
		padding: 0;
	}
`;

export const RightContent = styled.div`
	height: 100%;
	align-items: center;
	display: flex;
	margin-right: -15px;
`;
