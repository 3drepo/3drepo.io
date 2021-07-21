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

import styled from 'styled-components';

import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ArrowBack from '@material-ui/icons/ArrowBack';
import { Form } from 'formik';

import { COLOR } from '../../styles';
import { TextField as TextFieldComponent } from '../components/textField';
import { ContainedButton } from '../viewerGui/components/containedButton/containedButton.component';

export const StyledTextField = styled(TextField)``;

export const StyledCopyableTextField = styled(TextFieldComponent).attrs({
	withCopyButton: true,
})`
	width: 100%;
	margin: 16px 12px 8px 0;
`;

export const FieldsRow = styled(Grid)`
	${StyledCopyableTextField},
	${StyledTextField} {
		width: 100%;
		margin-left: 12px;
		margin-right: 12px;
	}

	${/* sc-selector */ StyledCopyableTextField}:nth-child(2n),
	${/* sc-selector */ StyledTextField}:nth-child(2n) {
		margin-left: 12px;
	}

	${/* sc-selector */ StyledCopyableTextField}:nth-child(2n + 1),
	${/* sc-selector */ StyledTextField}:nth-child(2n + 1) {
		margin-left: 0;
	}

	${/* sc-selector */ StyledCopyableTextField}:last-child,
	${/* sc-selector */ StyledTextField}:last-child {
		margin-right: 0;
	}
`;

export const SelectWrapper = styled(FormControl)`
	&& {
		margin-left: 12px;
		margin-top: 15px;
	}
`;

export const GridColumn = styled(Grid)`
	margin-top: 30px;

	&:first-of-type {
		margin-right: 12px;
	}

	&:last-of-type {
		margin-left: 12px;
	}
`;

export const StyledForm = styled(Form)`
	padding: 24px;
	padding-bottom: 80px;
	box-sizing: border-box;
	overflow-y: scroll;
	overflow-x: hidden;
	height: inherit;
`;

export const StyledContainedButton = styled(ContainedButton)`
	&& {
		margin-bottom: 16px;
	}
`;

export const Headline = styled(Typography)``;

export const SubHeadline = styled(Typography)`
	&& {
		font-size: 11px;
		color:${COLOR.BLACK_60};
		margin-bottom: 8px;
	}
`;

export const TypesGrid = styled(Grid)`
	margin-bottom: 30px;
`;

export const StyledIcon = styled(ArrowBack)`
	color: ${COLOR.WHITE};
`;

export const BackButton = styled.span`
	color: ${COLOR.SECONDARY_MAIN};
	color: ${COLOR.WHITE};
	margin-right: 15px;
	display: flex;
	text-decoration: none;
	line-height: 1;
	cursor: pointer;
`;

export const LoaderContainer = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: flex-start;
	padding-top: 100px;
	box-sizing: border-box;
`;

export const Container = styled.div`
	position: relative;
	height: 100%;
	overflow: hidden;
	flex: none;
`;

export const ButtonContainer = styled(Grid)`
	position: absolute;
	flex: none;
	bottom: 0;
	right: 40px;
	width: 100%;
	background: ${COLOR.LIGHT_GRAY};
	height: 80px;
	justify-content: center;
`;

export const ViewContainer = styled(Grid)`
	margin-top: 16px;
	margin-bottom: 8px;
`;
