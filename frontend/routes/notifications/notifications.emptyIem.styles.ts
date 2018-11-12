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
import styled from 'styled-components';
import { ListItem } from '@material-ui/core';
import { FONT_WEIGHT } from '../../styles';

export const EmptyItem = styled(ListItem)`
	&&& {
		height: calc(100% - 64px);
		display: flex;
		align-items: center;
		justify-content: center;
	}
`;

export const EmptyItemText = styled.h3`
	max-width: 142px;
	font-weight: ${FONT_WEIGHT.NORMAL};
	color: rgba(0,0,0,0.54);
`;
