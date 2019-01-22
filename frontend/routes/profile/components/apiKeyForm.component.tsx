/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import * as React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { omit } from 'lodash';

import {
	FormContainer,
	Headline,
	StyledTextField,
	FieldsRow,
	StyledButton
} from '../profile.styles';

interface IState {
	newPasswordStrengthMessage: string;
}

export class APIKeyForm extends React.PureComponent<{}, IState> {
	public state = {
		newPasswordStrengthMessage: ''
	};

	public render() {
		return (
			<div>My api key</div>
			);
	}
}
