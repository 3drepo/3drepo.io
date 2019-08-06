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
import { ListItem } from '@material-ui/core';
import styled from 'styled-components';
import { FONT_WEIGHT } from '../../../../../styles';

export const EmptyItem = styled(ListItem)`
	&& {
		display: flex;
		align-items: center;
		justify-content: center;
		padding-top: 100px;
		flex-direction: column;
	}
`;

export const EmptyItemText = styled.h3`
	text-align: center;
	font-weight: ${FONT_WEIGHT.NORMAL};
	color: rgba(0,0,0,0.54);
	font-size: 16px;
`;
