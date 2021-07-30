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

import Avatar from '@material-ui/core/Avatar';
import styled from 'styled-components';

import Icon from '@material-ui/core/Icon';
import { COLOR } from '../../../styles';

const DEFAULT_SIZE = 50;
const DEFAULT_FONT_SIZE = 20;

const getSize = ({ size = DEFAULT_SIZE }) => size;

export const StyledIcon = styled(Icon)``;

export const Container = styled.div`
	position: relative;
	width: ${getSize}px;
	height: ${getSize}px;
	min-width: ${getSize}px;
	font-size: ${(props: any) => props.fontSize || DEFAULT_FONT_SIZE}px;

	${StyledIcon} {
		font-size: ${(props: any) => getSize(props) * 0.6}px;
	}
`;

export const StyledAvatar = styled(Avatar)`
	&& {
		width: 100%;
		height: 100%;
		background: #e8eaf6;
		color: ${COLOR.PRIMARY_MAIN};
		font-size: inherit;
	}
`;

export const AvatarPlaceholder = styled(StyledAvatar)`
	&& {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 1;
		height: calc(100% + 2px);
		width: calc(100% + 1px);
		text-align: center;
	}
`;
