/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import { Form } from 'formik';

import { TextField } from '../../../../../components/textField/textField.component';
import { StyledLinkableField, StyledMarkdownField } from '../../../../../components/textField/textField.styles';

export const StyledForm = styled(Form)`
	display: flex;
	align-items: center;
	justify-content: center;
`;

export const StyledTextField = styled(TextField)`
	width: 100%;
	max-width: 250px;
	overflow: hidden;
	font-size: 24px;

	&& > div {
		margin: 0;
	}

	${/* sc-selector */ StyledMarkdownField},
	${/* sc-selector */ StyledLinkableField},
	input {
		text-overflow: ellipsis;
		font-size: 24px;
		text-align: center;
	}

	input {
		margin-right: 60px;
	}
`;

export const TextFieldWrapper = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
`;
