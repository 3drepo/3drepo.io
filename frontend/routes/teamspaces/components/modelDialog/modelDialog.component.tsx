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

import * as React from 'react';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';
import { upperFirst } from 'lodash';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

import { schema } from '../../../../services/validation';
import { CellSelect } from '../../../components/customTable/components/cellSelect/cellSelect.component';
import { Container } from './modelDialog.styles';

import { MODEL_TYPE, FEDERATION_TYPE } from './../../teamspaces.contants';

const ModelSchema = Yup.object().shape({
	name: schema.firstName.max(120),
	teamspace: Yup.string().required()
});

const commonInitialValues = {
	name: '',
	teamspace: '',
	project: '',
	unit: ''
};

const dataByType = {
	[MODEL_TYPE]: {
		initialValues: {
			code: '',
			type: '',
			revisionName: '',
			revisionDescription: '',
			file: ''
		}
	},
	[FEDERATION_TYPE]: {
		initialValues: {
			availableModels: [],
			federatedModels: []
		}
	}
};

interface IProps {
	name?: string;
	teamspace?: string;
	teamspaces: any[];
	handleResolve: (model) => void;
	handleClose: () => void;
	type: string;
}

interface IState {
	selectedTeamspace: string;
	selectedProject: string;
	projectsItems: any[];
	name: string;
}

export class ModelDialog extends React.PureComponent<IProps, IState> {
	public static defaultProps = {
		name: '',
		teamspace: ''
	};

	public state = {
		selectedTeamspace: '',
		projectsItems: [],
		selectedProject: '',
		name: ''
	};

	public handleModelSave = (values) => {
		// this.props.handleResolve(values);
	}

	public handleTeamspaceChange = (onChange) => (event, teamspaceName) => {
		this.setState({
			selectedTeamspace: teamspaceName,
			projectsItems: this.getTeamspaceProjects(teamspaceName)
		});
		onChange(event, teamspaceName);
	}

	public handleProjectChange = (onChange) => (event, projectName) => {
		this.setState({ selectedProject: projectName });
		onChange(event, projectName);
	}

	public handleNameChange = (onChange) => (event) => {
		this.setState({ name: event.currentTarget.value });
		onChange(event);
	}

	public getTeamspaceProjects = (teamspaceName) => {
		const selectedTeamspace = this.props.teamspaces.find((teamspace) => teamspace.value === teamspaceName);
		return selectedTeamspace.projects.map(({ name }) => ({ value: name }));
	}

	public renderModelFields = () => {
		return (
			<>
				<Field name="code" render={({ field, form }) => (
					<TextField
						{...field}
						label={`Model Code (optional)`}
						margin="normal"
						fullWidth={true}
					/>
				)} />
			</>
		);
	}

	public renderFederationFields = () => {
		return (
			<>
				federation fields
			</>
		)
	}

	public renderOtherFields = (type) => {
		if (type === FEDERATION_TYPE) {
			return this.renderFederationFields();
		} else if (type === MODEL_TYPE) {
			return this.renderModelFields();
		}
	}

	public render() {
		const { name, teamspace, teamspaces, handleClose, type } = this.props;
		const { projectsItems, name: typedName } = this.state;

		return (
			<Formik
				initialValues={ { ...commonInitialValues, ...dataByType[type].initialValues } }
				validationSchema={ModelSchema}
				onSubmit={this.handleModelSave}
			>
				<Form>
					<DialogContent>
						<FormControl fullWidth={true} required={true}>
							<InputLabel shrink htmlFor="teamspace-select">Teamspace</InputLabel>
							<Field name="teamspace" render={({ field, form }) => (
								<CellSelect
									{...field}
									error={Boolean(form.touched.teamspace && form.errors.teamspace)}
									helperText={form.touched.teamspace && (form.errors.teamspace || '')}
									items={teamspaces}
									placeholder="Select teamspace"
									disabled={Boolean(this.props.name)}
									disabledPlaceholder={true}
									inputId="teamspace-select"
									onChange={this.handleTeamspaceChange(field.onChange)}
								/>
							)} />
						</FormControl>

						{
							this.state.selectedTeamspace &&
								<FormControl fullWidth={true} required={true}>
									<InputLabel shrink htmlFor="project-select">Project</InputLabel>
									<Field name="project" render={({ field, form }) => (
										<CellSelect
											{...field}
											error={Boolean(form.touched.project && form.errors.project)}
											helperText={form.touched.project && (form.errors.project || '')}
											items={projectsItems}
											placeholder="Select project"
											disabled={Boolean(this.props.name)}
											disabledPlaceholder={true}
											inputId="project-select"
											onChange={this.handleProjectChange(field.onChange)}
										/>
									)} />
								</FormControl>
						}

						{
							this.state.selectedProject &&
								<>
									<Field name="name" render={({ field, form }) => (
										<TextField
											{...field}
											error={Boolean(form.touched.name && form.errors.name)}
											helperText={form.touched.name && (form.errors.name || '')}
											label={`${upperFirst(type)} Name`}
											margin="normal"
											required
											fullWidth={true}
											onChange={this.handleNameChange(field.onChange)}
										/>
									)} />
									{ typedName && this.renderOtherFields(type)}
								</>
						}

					</DialogContent>

					<DialogActions>
						<Button onClick={handleClose} color="secondary">Cancel</Button>
						<Field render={({ form }) => {
							return (
								<Button
									type="submit"
									variant="raised"
									color="secondary"
									disabled={!form.isValid || form.isValidating}
								>
									Save
							</Button>
							)
						}} />
					</DialogActions>
				</Form>
			</Formik>
		);
	}
}
