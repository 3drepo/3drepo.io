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
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import { Field, Form, Formik } from 'formik';
import memoizeOne from 'memoize-one';
import React from 'react';

import * as Yup from 'yup';

import { VALIDATIONS_MESSAGES } from '../../../../services/validation';
import { CellSelect } from '../../../components/customTable/components/cellSelect/cellSelect.component';

const ProjectSchema = Yup.object().shape({
	name: Yup.string()
		.required()
		.max(120, VALIDATIONS_MESSAGES.TOO_LONG_STRING)
		.matches(/^[^/?=#+]{0,119}[^/?=#+]{1}$/, 'Name should not contain special characters: "/", "?", "=", "#", "+".'),
	teamspace: Yup.string().required()
});

interface IProps {
	id?: string;
	name?: string;
	teamspace?: string;
	teamspaces: any[];
	handleClose: () => void;
	createProject: (teamspace, projectData) => void;
	updateProject: (teamspace, projectName, projectData) => void;
}

const getTeamspacesItems = memoizeOne((teamspaces) => teamspaces.map(({ account }) => ({
	value: account,
	name: account
})));

export class ProjectDialog extends React.PureComponent<IProps, any> {
	public static defaultProps = {
		name: '',
		teamspace: ''
	};

	public get isNewProject() {
		return !this.props.id;
	}

	public get data() {
		const { name, id } = this.props;
		return { name, _id: id };
	}

	public handleProjectSave = ({ teamspace, name }) => {
		const { createProject, updateProject, handleClose } = this.props;
		const updatedProject = { ...this.data, name: name.trim() };

		if (this.isNewProject) {
			createProject(teamspace, updatedProject);
		} else {
			updateProject(teamspace, this.data._id, updatedProject);
		}
		handleClose();
	}

	public render() {
		const { name, teamspace, handleClose } = this.props;
		const teamspaces = getTeamspacesItems(this.props.teamspaces);

		return (
			<Formik
				initialValues={{name, teamspace}}
				validationSchema={ProjectSchema}
				onSubmit={this.handleProjectSave}
			>
				<Form>
					<DialogContent>
						<FormControl fullWidth required>
							<InputLabel shrink htmlFor="teamspace-select">Teamspace</InputLabel>
							<Field name="teamspace" render={ ({ field, form }) => (
								<CellSelect
									{...field}
									error={Boolean(form.touched.teamspace && form.errors.teamspace)}
									helperText={form.touched.teamspace && (form.errors.teamspace || '')}
									items={teamspaces}
									placeholder="Select teamspace"
									disabled={Boolean(this.props.name)}
									disabledPlaceholder
									inputId="teamspace-select"
								/>
							)} />
						</FormControl>
						<Field name="name" render={ ({ field, form }) => (
							<TextField
								{...field}
								error={Boolean(form.touched.name && form.errors.name)}
								helperText={form.touched.name && (form.errors.name || '')}
								label="Name"
								margin="normal"
								required
								fullWidth
							/>
						)} />
					</DialogContent>

					<DialogActions>
						<Button
							onClick={handleClose}
							color="secondary"
						>
							Cancel
						</Button>
						<Field render={ ({ form }) => (
							<Button
								type="submit"
								variant="contained"
								color="secondary"
								disabled={!form.isValid || form.isValidating}
							>
								Save
							</Button>
						)} />
					</DialogActions>
				</Form>
			</Formik>
		);
	}
}
