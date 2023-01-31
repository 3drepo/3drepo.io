/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { Typography } from '@controls/typography';

export const CommentAuthor = styled.div`
	font-weight: 600;
	font-size: 11px;
	line-height: 18px;
	margin-bottom: 2px;
`;

export const CommentButtons = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	height: 100%;
	margin: 0 6px;
	position: absolute;
	top: 0;
`;

export const CommentMessage = styled(Typography).attrs({ variant: 'body1' })`
	word-break: break-word;
`;

const CommentSmallText = styled.span`
	font-weight: 400;
	font-size: 9px;
	line-height: 16px;
`;

export const EditedCommentLabel = styled(CommentSmallText)`
	text-align: left;
`;

export const CommentTime = styled(CommentSmallText)`
	text-align: right;
`;

export type CommentProps = {
	'data-author': string,
};

export const BasicComment = styled.div<CommentProps>`
	max-width: 241px;
	width: fit-content;
	margin-top: 12px;
	padding: 10px 12px 12px;
	box-sizing: border-box;
	border-radius: 10px;
	display: flex;
	flex-direction: column;
	position: relative;

	${CommentButtons} {
		display: flex;
		opacity: 0;
		transition: opacity .3s;
		pointer-events: none;
	}

	@keyframes activateButtons {
		100% {
			pointer-events: initial;
		}
	}

	&:hover ${CommentButtons} {
		opacity: 1;
		transition-delay: .3s;
		animation: activateButtons forwards;
		animation-delay: .5s;
	}

	&::before {
		content: '';
		width: 400px;
		height: 100%;
		position: absolute;
		top: -2px;
	}

	&[data-author="${(props) => props['data-author']}"] {
		& + & {
			margin-top: 4px;

			& > ${CommentAuthor} {
				display: none;
			}
		}
	}
`;
