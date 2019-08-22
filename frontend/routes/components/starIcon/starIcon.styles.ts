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

import { Icon } from '@material-ui/core';
import styled from 'styled-components';
import { COLOR } from '../../../styles';

interface IIconWrapper {
	active: boolean;
}

export const IconWrapper = styled(Icon)<IIconWrapper>`
	color: ${(props) => props.active ? COLOR.SUNGLOW : COLOR.BLACK_20};
	cursor: pointer;
	display: flex;
	align-items: center;

	&& {
		width: auto;
		height: auto;
	}
`;
