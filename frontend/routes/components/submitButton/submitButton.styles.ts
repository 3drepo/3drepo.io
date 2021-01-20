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

import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import styled from 'styled-components';

export const StyledButton = styled(Button)`
	&& {
		position: relative;
		overflow: hidden;
	}
`;

export const StyledFab = styled(Fab)`
	&& {
		position: relative;
		overflow: hidden;
	}
`;

export const LoaderContainer = styled.div`
	position: absolute;
	background: rgb(220, 220, 220, 0.85);
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
`;
