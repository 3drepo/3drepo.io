/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import { Avatar as AvatarComponent } from '@mui/material';

import { COLOR } from '../../../../../../../styles';
import { MarkdownMessage } from '../markdownMessage/markdownMessage.component';

export const Container = styled.span`
	color: ${COLOR.BLACK_60};
	font-size: 11px;
	padding: 10px;
	display: flex;
	align-items: center;
`;

export const CommentWrapper = styled.div`
	margin-left: 10px;
	margin-right: 5px;
`;

export const Avatar = styled(AvatarComponent)`
	&& {
		height: 34px;
		width: 34px;
		color: ${COLOR.BLACK_60 };
		background-color: transparent;
	}
`;

export const MarkdownComment = styled(MarkdownMessage)`
	margin: 0;
	color: ${COLOR.BLACK_50};
	font-size: 11px;
	display: inline;

	${CommentWrapper} {
		display: inline;
		margin: 0;
	}
`;

export const DateTimeContainer = styled.div`
	display: inline;
`;
