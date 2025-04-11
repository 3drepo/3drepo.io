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
import { Typography } from '@controls/typography';
import { FormTextAreaFixedSize } from '@controls/inputs/formInputs.component';
import { Container as TextAreaContainer } from '@controls/inputs/textArea/textAreaFixedSize.styles';
import { SubmitButton } from '@controls/submitButton';
import { ImageWithSkeleton } from '@controls/imageWithSkeleton/imageWithSkeleton.component';
import { DragAndDrop as DragAndDropBase } from '@controls/dragAndDrop';
import { DashedContainer } from '@controls/dragAndDrop/dragAndDrop.styles';

export const Container = styled.section`
	display: flex;
	flex-direction: column;
	padding: 0 0 11px;
	overflow-x: hidden;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	position: sticky;
	bottom: 0;
	border-radius: 0 0 8px 8px;
`;

export const MessageAndImages = styled.div``;

export const CommentReplyContainer = styled.div`
	position: relative;
	margin: 11px 15px 0;
`;

export const DeleteButton = styled.div<{ error?: boolean }>`
	position: absolute;
	z-index: 3;
	top: -7px;
	right: -7px;
	height: 24px;
	width: 24px;

	display: flex;
	align-items: center;
	justify-content: center;

	background: ${({ theme }) => theme.palette.primary.contrast};
	border-radius: 100%;
	box-shadow: 0 3px 8px 1px rgba(0, 0, 0, 0.20);
	cursor: pointer;

	svg {
		width: 10px;
	}
	
	${({ error, theme }) => error && css`
		background-color: ${theme.palette.error.lightest};
		color: ${theme.palette.error.main};
	`}
`;

export const DragAndDrop = styled(DragAndDropBase).attrs({
	$dashSize: 2,
})<{ $hidden?: boolean }>`
	margin: 10px 15px;
	width: calc(100% - 30px);

	${DashedContainer} {
		padding: 13px;
	}
`;

export const Images = styled.div`
	max-height: 100px;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 10px;
	padding: 10px 15px 0;
	position: relative;
	overflow-y: overlay;

	&:not(:empty) {
		min-height: 59px;
	}
`;

export const ImageContainer = styled.div`
	position: relative;
	width: 44px;
	height: 44px;
`;

export const Image = styled(ImageWithSkeleton)<{ $error?: boolean }>`
	object-fit: cover;
	box-sizing: border-box;
	border-radius: 8px;
	overflow: hidden;
	width: 100%;
	height: 100%;

	&:is(img) {
		cursor: pointer;
	}

	${({ $error, theme }) => $error && css`
		border: solid 1px ${theme.palette.error.main};
	`}
`;

export const ErroredImageMessages = styled.div`
	color: ${({ theme }) => theme.palette.error.main};
	margin: 0 0 4px 15px;
`;

export const MessageInput = styled(FormTextAreaFixedSize)`
	padding: 8px 15px 0;
	overflow: hidden;

	:after {
		content: '';
		box-shadow: 0 0 9px 7px ${({ theme }) => theme.palette.primary.contrast};
		z-index: 1;
	}

	.MuiInputBase-multiline {
		padding: 0;
		line-height: 16px;
	}

	${TextAreaContainer} {
		overflow-y: scroll;
		border: none;
		box-shadow: none;
	}
`;

export const Controls = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	box-sizing: border-box;
	position: relative;
	padding: 6px 15px 0;
`;

export const CharsCounter = styled(Typography).attrs({
	variant: 'body1',
})<{ $error?: boolean }>`
	margin: 1px 0 0 11px;
	font-weight: 500;
	color: ${({ theme: { palette }, $error }) => ($error ? palette.error.main : palette.base.lighter)};
`;

export const ActionIcon = styled.div`
	cursor: pointer;
	display: flex;
	padding: 4px;
	color: ${({ theme }) => theme.palette.secondary.main};
	height: 24px;
	svg {
		height: 100%;
		width: 100%;
	}
`;

export const SendButton = styled(SubmitButton).attrs({
	color: 'primary',
	variant: 'contained',
})`
	margin: 0 15px 0 auto;
	border-radius: 50%;
	padding: 0;
	min-width: unset;
	width: 34px;
	height: 34px;
`;

export const EditCommentButtons = styled.div`
	margin: 4px 5px 0 auto;
	display: flex;
	flex-direction: row;
`;
