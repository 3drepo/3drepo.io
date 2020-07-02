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

import styled, { css } from 'styled-components';

import { COLOR } from '../../../../../../../styles';
import { MarkdownMessage } from '../markdownMessage/markdownMessage.component';

export const Container = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	position: relative;
`;

export const Comment = styled(MarkdownMessage)`
	margin: 0;
	color: ${COLOR.BLACK_50};
	font-size: 12px;

	p {
		margin: 0;
	}
`;

const regularCommentStyles = css`
	background-color: ${COLOR.WHITE};

	${Comment} {
		color: ${COLOR.BLACK_60};
	}
`;

const selfCommentStyles = css`
	background-color: ${COLOR.LIGHT_GREY_BLUE};
`;

export const CommentContainer = styled.div`
	width: 100%;
	margin-left: 10px;
	margin-right: 32px;
	padding: 8px 14px;
	border-radius: 10px;
	${({ self }: { self: boolean; }) => self ? selfCommentStyles : regularCommentStyles};
`;
