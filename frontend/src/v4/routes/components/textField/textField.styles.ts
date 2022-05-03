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

import styled, { css } from 'styled-components';

import { IconButton, InputLabel, TextField } from '@mui/material';

import { isV5 } from '@/v4/helpers/isV5';
import { ContainedButton } from '../../viewerGui/components/containedButton/containedButton.component';
import { LinkableField } from '../linkableField/linkableField.component';
import { MarkdownField } from '../markdownField/markdownField.component';

const containerEditModeStyles = css`
	align-items: baseline;
`;

const containerNonEditModeStyles = css`
	align-items: flex-end;
`;

export const Container = styled.div`
	position: relative;
	display: flex;
	${({ editMode }: { editMode: boolean }) => editMode ? containerEditModeStyles : containerNonEditModeStyles};
`;

export const ActionsLine = styled.div`
	position: absolute;
	${isV5() ? css`
		bottom: 0;
		right: 5px;
	` : css`
		bottom: 4px;
		right: 0;
	`}
`;

export const StyledIconButton = styled(IconButton)`
	&& {
		padding: 5px;
		margin-right: 0;
	}
`;

export const StyledTextField = styled(TextField)`
	&& {
		margin: 8px 0;

		textarea {
			min-height: 17px;
			padding-right: 56px;
			box-sizing: border-box;
		}
	}
`;

export const StyledMarkdownField = styled(MarkdownField)`
	&& {
		display: block;
		position: relative;
		margin: 8px 0;
		min-height: 14px;
		font-size: 14px;
		overflow: hidden;

		${ isV5() && css`
			border: 1px solid #C1C8D5; // TODO: fix after new palette is released
			border-radius: 5px;
			min-height: 2rem;
			padding: 5px 10px;
			margin-top: 17px;
			margin-bottom: 0px;
			background-color: ${({ theme }) => theme.palette.primary.contrast };
			p {
				margin: 0;
			}
		`}
	}
`;

export const StyledLinkableField = styled(LinkableField)`
	&& {
		display: block;
		position: relative;
		margin: 8px 0;
		min-height: 14px;
		font-size: 14px;
		overflow: hidden;
	}
`;

export const FieldWrapper = styled.div<{ line: number }>`
	position: relative;
	width: 100%;

	&:after {
		left: 0;
		right: 0;
		bottom: 0;
		content: '';
		position: absolute;
		border-bottom: ${({ line }) => line ? `1px solid rgba(0, 0, 0, 0.12);` : `none`};
		pointer-events: none;
	}
`;

export const MutableActionsLine = styled(ActionsLine)`
	&&	 {
		visibility: hidden;

		${/* sc-selector */ Container}:hover & {
			visibility: inherit;
		}
	}
`;

export const FieldLabel = styled(InputLabel)`
	&& {
		display: block;
	}
`;

export const CopyButton = styled(ContainedButton)`
	&& {
		margin-left: 8px;
	}
`;
