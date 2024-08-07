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

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Dropzone from 'react-dropzone';
import styled from 'styled-components';

import { COLOR } from '../../styles';
import { TextField as TextFieldComponent } from '../components/textField';

export const FormContainer = styled(Grid)`
	padding: 24px;
`;

export const Container = styled.div`
	height: 100%;
	width: 100%;

	& > form:not(:first-child) ${FormContainer} {
		padding-top: 0;
	}
`;

export const Headline = styled(Typography)``;

export const StyledButton = styled(Button)`
	&& {
		margin-top: 16px;
		align-self: flex-end;
	}
`;

export const StyledButtonContainer = styled.div`
	&& {
		margin-top: 16px;
		align-self: flex-end;
	}

	& > button {
		margin-right: 10px;
	}
`;

export const DeleteButton = styled(Button)`
	color: ${COLOR.WHITE_87};
	background-color:  rgba(234, 57, 57, 0.87);

	&:hover {
		background-color:  rgba(234, 57, 57, 1);
	}
`;

export const StyledTextField = styled(TextField)``;

export const StyledCopyableTextField = styled(TextFieldComponent).attrs({
	withCopyButton: true,
})`
	width: 100%;
`;

export const FieldsRow = styled(Grid)`
	${StyledTextField} {
		width: 100%;
		margin-left: 12px;
		margin-right: 12px;
	}

	${/* sc-selector */ StyledTextField}:nth-child(2n) {
		margin-left: 12px;
	}

	${/* sc-selector */ StyledTextField}:nth-child(2n + 1) {
		margin-left: 0;
	}

	${/* sc-selector */ StyledTextField}:last-child {
		margin-right: 0;
	}
`;

export const StyledDropzone = styled(Dropzone)`
	&& {
		min-width: 110px;
		min-height: 110px;
		margin-right: 24px;
		height: 110px;
		width: 110px;
		margin-top: 24px;
		box-sizing: border-box;
		border: 1px solid #dcdcdc;
		border-radius: 100%;
		cursor: pointer;
		overflow: hidden;
	}
`;

export const DropzoneContent = styled.div`
	width: 100%;
	height: 100%;
	position: relative;
`;

export const DropzoneMessage = styled.div`
	font-size: 33px;
	color: #4e4e4e;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
	padding-bottom: 5px;
	box-sizing: border-box;
`;

export const DropzonePreview = styled.div<{ src?: any }>`
	background-image: ${({ src }) => src ? `url('${(src)}')` : 'transparent'};
	width: 100%;
	height: 100%;
	background-size: cover;
	background-position: center;

	& + ${DropzoneMessage} {
		position: absolute;
		z-index: 1;
		opacity: 0;
		transition: all 200ms ease-in-out;
	}

	& + ${/* sc-selector */ DropzoneMessage}:hover {
		background: rgba(220, 220, 220, 0.85);
		opacity: 1;
	}
`;

export const DropzoneProgress = styled(CircularProgress)`
	&& {
		position: absolute;
	}
`;
