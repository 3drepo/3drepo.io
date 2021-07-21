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

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import styled from 'styled-components';
import { ellipsis, FONT_WEIGHT } from '../../../styles';
import * as AvatarStyles from '../avatar/avatar.styles';

export const Container = styled.div`
	width: 300px;

	${AvatarStyles.Container} {
		margin: 8px;
		margin-left: -4px;
	}
`;

export const StyledList = styled(List)`
	&& {
		padding-top: 0;
		padding-bottom: 0;
	}
`;

export const UserContainer = styled(ListItem)`
	&& {
		padding: 12px 24px;
	}
`;

export const UserData = styled.div`
	display: flex;
	flex-direction: column;
	align-self: center;
	margin-left: 12px;
	overflow: hidden;
`;

export const UserName = styled.h3`
	font-size: 16px;
	font-weight: ${FONT_WEIGHT.NORMAL};
	margin: 0;
	${ellipsis('100%')}
`;

export const UserEmail = styled.p`
	color: rgba(0,0,0,0.54);
	font-size: 14px;
	font-weight: ${FONT_WEIGHT.SEMIBOLD};
	margin: 0;
	${ellipsis('100%')}
`;

export const LoadingText = styled.div`
	align-self: center;
	margin-left: 12px;
`;
