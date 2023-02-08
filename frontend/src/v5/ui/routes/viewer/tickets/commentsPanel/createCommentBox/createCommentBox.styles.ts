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
import { FormTextAreaFixedSize } from '@controls/inputs/formInputs.component';
import { Container as TextAreaContainer } from '@controls/inputs/textArea/textAreaFixedSize.styles';
import { SubmitButton } from '@controls/submitButton';

export const Container = styled.section`
	display: flex;
	flex-direction: column;
	border: solid 0 ${({ theme }) => theme.palette.secondary.lightest};
	border-top-width: 1px;
	padding: 0 15px 11px;
`;

export const CommentReplyContainer = styled.div`
	position: relative;
	margin-top: 11px;
`;

export const DeleteButton = styled.div`
	position: absolute;
	top: -7px;
	right: -7px;
	height: 24px;
	width: 24px;

	display: flex;
	align-items: center;
	justify-content: center;

	background: ${({ theme }) => theme.palette.primary.contrast};
	border-radius: 100%;
	box-shadow: 0 3px 5px rgba(0, 0, 0, 0.15);
	cursor: pointer;

	svg {
		width: 10px;
	}
`;

export const MessageInput = styled(FormTextAreaFixedSize)`
	.MuiInputBase-multiline {
		padding: 8px 0 6px;
		line-height: 16px;
	}

	${TextAreaContainer} {
		border: none;
		box-shadow: none;
		padding: 0;
	}
`;

export const Controls = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	padding-top: 6px;
	box-sizing: border-box;
	box-shadow: 0 0 9px 7px ${({ theme }) => theme.palette.primary.contrast};
	position: relative;
`;

export const CharsCounter = styled(Typography).attrs({
	variant: 'body1',
})<{ $error?: boolean }>`
	margin: 1px 0 0 11px;
	font-weight: 500;
	color: ${({ theme: { palette }, $error }) => ($error ? palette.error.main : palette.base.lighter)};
`;

export const FileIconButton = styled.div`
	cursor: pointer;
	display: flex;
	padding: 4px;
	color: ${({ theme }) => theme.palette.secondary.main};
`;

export const SendButton = styled(SubmitButton).attrs({
	color: 'primary',
	variant: 'contained',
})`
	margin: 0 0 0 auto;
	border-radius: 50%;
	padding: 0;
	min-width: unset;
	width: 34px;
	height: 34px;
`;
