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

import React from 'react';

import Grid from '@material-ui/core/Grid';
import * as Yup from 'yup';

import { Field, Form, Formik } from 'formik';
import { ColorPicker } from '../colorPicker/colorPicker.component';
import {
	Container,
	SaveButton,
	StyledTextField,
	StyledTextFieldContainer,
	Title
} from './newJobForm.styles';

const NewJobSchema = Yup.object().shape({
	name: Yup.string()
		.max(50, 'Job name is limited to 50 characters')
		.required('Job name is a required field')
});

interface IProps {
	title: string;
	colors: string[];
	onSave: (job) => void;
	onCancel: () => void;
}

export class NewJobForm extends React.PureComponent<IProps, any> {
	public state = {
		color: ''
	};

	public handleColorChange = (value) => {
		this.setState({ color: value } as any);
	}

	public handleSave = ({ name }) => {
		this.props.onSave({
			name,
			...this.state
		});
	}

	public render() {
		const { title, colors } = this.props;
		const { color } = this.state;

		return (
			<Container>
				<Grid
					container
					direction="column">
					<Title>{title}</Title>
					<Formik
						initialValues={{
							name: '',
						}}
						validationSchema={NewJobSchema}
						onSubmit={this.handleSave}
					>
						<Form>
						<Grid
							item
							container
							direction="row"
							spacing={2}
							wrap="nowrap"
						>
							<StyledTextFieldContainer item>
								<Field name="name" render={ ({ field, form }) => (
									<StyledTextField
										{...field}
										error={Boolean(form.errors.name)}
										helperText={form.errors.name}
										placeholder="Set job name"
										margin="normal"
										fullWidth
										autoFocus
										InputLabelProps={ {
											shrink: true
										} }
									/>
								)} />
							</StyledTextFieldContainer>
							<Grid item>
								<ColorPicker
									value={color}
									predefinedColors={colors}
									onChange={this.handleColorChange}
								/>
							</Grid>
						</Grid>
						<Field render={ ({ form }) =>
							<SaveButton
								type="submit"
								variant="contained"
								color="secondary"
								disabled={!form.isValid || form.isValidating}
								aria-label="Add new job">
								+ Add job
							</SaveButton>}
						/>
						</Form>
					</Formik>
				</Grid>
			</Container>
		);
	}
}
