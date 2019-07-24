/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import Grid from '@material-ui/core/Grid';
import Grow from '@material-ui/core/Grow';
import styled from 'styled-components';

export const Container = styled.div``;

export const StyledGrid = styled(Grid)`
	&& {
    width: 100%;
    height: 100%;
    position: absolute;
    right: 0;
    top: 0;
    background: white;
    position: absolute;
	}

  pointer-events: ${(props) => props.opened ? 'all' : 'none'};
`;

export const StyledGrow = styled(Grow)`
	&& {
		transform-origin: right;
	}
`;
