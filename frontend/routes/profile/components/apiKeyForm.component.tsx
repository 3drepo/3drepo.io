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

interface IProps {
	apiKey: string;
	onGenerateApiKey: () => void;
	onDeleteApiKey: () => void;
}

export class APIKeyForm extends React.PureComponent<IProps> {
	public render() {
		const apiKey =  this.props.apiKey;
		return (
			<div>
				<div>My api key:{apiKey}</div>
				<button onClick={this.onClickGenerate}> generate</button>
				<button onClick={this.onClickDelete}> delete</button>

			</div>);
	}

	private onClickGenerate = (e: React.SyntheticEvent) => {
		e.stopPropagation();
		this.props.onGenerateApiKey();
	}

	private onClickDelete = (e: React.SyntheticEvent) => {
		e.stopPropagation();
		this.props.onDeleteApiKey();
	}
}
