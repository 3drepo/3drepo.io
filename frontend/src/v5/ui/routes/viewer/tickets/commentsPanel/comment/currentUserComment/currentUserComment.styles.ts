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
import { FormTextArea } from '@controls/inputs/formInputs.component';
import { CommentInput } from '../../commentsPanel.styles';
import { BasicComment, CommentAuthor, CommentBody, CommentButtons } from '../comment.styles';

export const CommentContainer = styled(BasicComment)`
	background-color: ${({ theme }) => theme.palette.secondary.main};
	color: ${({ theme }) => theme.palette.primary.contrast};
	border-top-right-radius: 0;
    align-self: end;

	&::before {
		right: 100%;
	}

	${CommentButtons} {
		left: -94px;
	}

	${CommentBody} {
		${({ $deleted, theme }) => $deleted && css`
			color: ${theme.palette.secondary.light};
			text-align: right;
		`}
	}

	& > ${CommentAuthor} {
		display: none;
	}

	& + & {
		border-top-right-radius: 10px;
	}
`;

export const EditCommentContainer = styled(BasicComment)`
	border-radius: 0;
	border: solid 1px ${({ theme }) => theme.palette.secondary.lightest};
	border-bottom-color: ${({ theme }) => theme.palette.primary.main};
	margin-left: auto;
	width: 380px;
`;

export const EditCommentInput = styled(CommentInput).attrs({
	as: FormTextArea,
	minRows: 1,
})`
	.MuiInputBase-multiline {
		padding: 0;

		& fieldset,
		&:hover fieldset {
			border: none;
		}
	}
	
		
	.Mui-focused:not(.Mui-disabled) fieldset.MuiOutlinedInput-notchedOutline {
		border: none;
		box-shadow: none;
	}
`;

export const EditCommentButtons = styled.div`
    margin: 4px 5px 0 auto;
	display: flex;
	flex-direction: row;
`;
