/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import styled, { css } from 'styled-components';
import RemoveCircleOutline from '@material-ui/icons/RemoveCircleOutline';
import IconButtonComponent from '@material-ui/core/IconButton';

export const RemoveIcon = styled(RemoveCircleOutline)`
	&& {
		font-size: 20px;
	}
`;

export const IconButton = styled(IconButtonComponent)`
	&& {
		width: 28px;
		height: 28px;
		padding: 4px;
	}
`;
