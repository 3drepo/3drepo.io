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

import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { Form } from 'formik';
import styled from 'styled-components';

import { COLOR, FONT_WEIGHT } from '../../styles';

export const Container = styled.div`
	height: 100%;
`;

export const StyledTextField = styled(TextField)``;

export const StyledSelectField = styled(Select)``;

export const StyledSelectItem = styled(MenuItem)``;

export const StyledInputLabel = styled(InputLabel)``;

export const StyledFormControl = styled(FormControl)`
	width: 100%;

	&& {
		margin-top: 16px;
		margin-bottom: 8px;
	}
`;

export const StyledButton = styled(Button)`
	&& {
		margin-left: 14px;
	}
`;

export const FormContainer = styled(Grid)`
	&& {
		padding: 24px;
		background-color: rgb(250, 250, 250);
		height: 100%;
		justify-content: space-between;
	}
`;

export const FieldsColumn = styled.div``;

export const FieldsRow = styled(Grid)`
	overflow: auto;

	${StyledTextField} {
		width: 100%;
	}

	> ${/* sc-selector */ StyledTextField}:nth-child(1) {
		margin-right: 12px;
	}

	${/* sc-selector */ FieldsColumn}:nth-child(2n) {
		margin-left: 12px;
	}

	${/* sc-selector */ FieldsColumn}:nth-child(2n + 1) {
		margin-right: 12px;
	}
`;

export const FormFooter = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 32px;
`;

export const ConfirmContainer = styled.div`
	display: flex;
	align-items: center;
	margin-left: auto;
	width: 190px;
`;

export const FormInfoContainer = styled.div``;

export const PayPalInfoContainer = styled.div``;

export const FormInfo = styled.p`
	margin: 0 0 5px;
	font-size: 12px;
	color: ${COLOR.BLACK_40};
`;

export const PayPalLogo = styled.img`
	height: 20px;
`;

export const StyledForm = styled(Form)`
	height: 100%;
`;

export const PayPalWarning = styled.p`
	margin-top: 2px;
	font-size: 12px;
	color: ${COLOR.RED};
	font-weight: ${FONT_WEIGHT.BOLD};
	width: 220px;
`;
