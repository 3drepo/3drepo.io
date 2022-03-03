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

import { Avatar as AvatarComponent } from '@mui/material';
import styled from 'styled-components';
import { COLOR, FONT_WEIGHT } from '../../../../styles';
import { TreeList, TREE_LEVELS } from '../../../components/treeList/treeList.component';

const DEFAULT_AVATAR_SIZE = 30;

export const OwnerData = styled.div`
	font-size: 14px;
	width: 100%;
	color: ${COLOR.DARK_GRAY};
`;

export const Avatar = styled(AvatarComponent)`
	&& {
		height: ${(props) => props.size || DEFAULT_AVATAR_SIZE}px;
		width: ${(props) => props.size || DEFAULT_AVATAR_SIZE}px;
		background-color: ${(props) => !props.src ? COLOR.BLACK_20 : `transparent`};
		color: ${COLOR.WHITE};
		font-size: ${(props) => Math.round((props.size || DEFAULT_AVATAR_SIZE) * 14 / DEFAULT_AVATAR_SIZE)}px;
	}
`;

export const Container = styled(TreeList).attrs({
	level: TREE_LEVELS.TEAMSPACE
})`
	font-weight: ${FONT_WEIGHT.BOLD};
`;
