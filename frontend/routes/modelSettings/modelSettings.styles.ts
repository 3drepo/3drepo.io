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
import { Link } from 'react-router-dom';
import { COLOR } from '../../styles/colors';
import { Form } from 'formik';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import ArrowBack from '@material-ui/icons/ArrowBack';

export const StyledTextField = styled(TextField)``;

export const FieldsRow = styled(Grid)`
	${StyledTextField} {
		width: 100%;
		margin-left: 12px;
		margin-right: 12px;
	}

	${StyledTextField}:nth-child(2n) {
		margin-left: 12px;
	}

	${StyledTextField}:nth-child(2n + 1) {
		margin-left: 0;
	}

	${StyledTextField}:last-child {
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
	box-sizing: border-box;
	overflow: scroll;
`;

export const Headline = styled(Typography)``;

export const TypesGrid = styled(Grid)`
	margin-bottom: 30px;
`;

export const StyledIcon = styled(ArrowBack)`
	color: ${COLOR.WHITE};
`;

export const BackButton = styled.span`
	color: green;
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
