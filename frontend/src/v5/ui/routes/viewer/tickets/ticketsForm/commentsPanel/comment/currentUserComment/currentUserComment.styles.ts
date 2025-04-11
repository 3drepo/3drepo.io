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

import styled, { css } from 'styled-components';
import { BasicComment } from '../basicComment/basicComment.component';
import { CommentWithButtonsContainer as CommentWithButtonsContainerBase } from '../basicComment/basicComment.styles';
import { QuotedMessage, secondaryQuotedMessageStyles } from '../quotedMessage/quotedMessage.styles';
import { CommentBox } from '../../commentBox/commentBox.component';
import { MessageAndImages } from '../../commentBox/commentBox.styles';

export const CommentWithButtonsContainer = styled(CommentWithButtonsContainerBase)`
	justify-content: flex-end;
	${QuotedMessage} {
		${secondaryQuotedMessageStyles}
	}
`;

export const Comment = styled(BasicComment)<{ isFirstOfBlock: boolean }>`
	background-color: ${({ theme }) => theme.palette.secondary.main};
	color: ${({ theme }) => theme.palette.primary.contrast};
	align-self: end;

	${({ isFirstOfBlock }) => isFirstOfBlock && css`
		border-top-right-radius: 0;
	`}
`;

export const EditComment = styled(CommentBox)`
	width: 260px;
	align-self: end;

	${MessageAndImages} {
		border: 1px solid ${({ theme }) => theme.palette.secondary.lightest};
		border-bottom-color: ${({ theme }) => theme.palette.primary.main};
		margin-top: 10px;
	}
`;
