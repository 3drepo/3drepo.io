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

import { HoverPopover as HoverPopoverBase } from '@controls/hoverPopover/hoverPopover.component';
import styled, { css } from 'styled-components';
import { Typography } from '@controls/typography';
import { FormTextArea } from '@controls/inputs/formInputs.component';
import { CommentInput } from '../commentsPanel.styles';

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

export const CommentBody = styled(Typography).attrs({ variant: 'body1' })`
	word-break: break-word;
`;

export const CommentTime = styled.span`
	font-weight: 400;
	font-size: 9px;
	line-height: 16px;
	text-align: right;
`;

type CommentProps = {
	'data-author': string,
	$deleted?: boolean,
};
const BasicComment = styled.div<CommentProps>`
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
		display: none;
	}

	&:hover ${CommentButtons} {
		display: flex;
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

export const CurrentUserMessageContainer = styled(BasicComment)`
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

export const HoverPopover = styled(HoverPopoverBase)`
	position: absolute;
    left: -32px;;
	margin-top: -10px;

	.MuiAvatar-root {
		border: none;
	}
`;

export const OtherUserMessageContainer = styled(BasicComment)`
	background-color: ${({ theme }) => theme.palette.tertiary.lighter};
	color: ${({ theme }) => theme.palette.secondary.main};
	margin-left: 37px;
	border-top-left-radius: 0;

	&::before {
		left: 100%;
	}

	${CommentButtons} {
		right: -40px;
	}

	${CommentBody} {
		${({ $deleted, theme }) => $deleted && css`
			color: ${theme.palette.base.light};
		`}
	}

	&[data-author="${(props) => props['data-author']}"] {
		& + & {
			border-top-left-radius: 10px;

			${HoverPopover} {
				display: none;
			}
		}
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
