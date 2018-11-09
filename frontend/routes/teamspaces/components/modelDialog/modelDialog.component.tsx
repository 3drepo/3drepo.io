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

import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';

import { clientConfigService } from '../../../../services/clientConfig';
import { schema } from '../../../../services/validation';
import { CellSelect } from '../../../components/customTable/components/cellSelect/cellSelect.component';

import { Row, SelectWrapper, FieldWrapper } from './modelDialog.styles';
import { MODEL_SUBTYPES } from './../../teamspaces.contants';

const ModelSchema = Yup.object().shape({
	modelName: schema.firstName.max(120).required(),
	teamspace: Yup.string().required(),
	project: Yup.string().required(),
	unit: Yup.string().required(),
	type: Yup.string().required(),
	code: Yup.string().max(5).matches(/^[A-Za-z0-9]+$/)
});

interface IProps {
	modelName?: string;
	teamspace?: string;
	project?: string;
	teamspaces: any[];
	projects?: any[];
	handleResolve: (model) => void;
	handleClose: () => void;
	modelId: string;
}

interface IState {
	selectedTeamspace: string;
	selectedProject: string;
	projectsItems: any[];
	modelName: string;
	unit: string;
}

export class ModelDialog extends React.PureComponent<IProps, IState> {
	public static getDerivedStateFromProps(nextProps: IProps) {
		const newState = {} as any;

		if (Boolean(nextProps.teamspace)) {
			newState.selectedTeamspace = nextProps.teamspace;
		}

		if (Boolean(nextProps.project) && Boolean(nextProps.projects)) {
			newState.selectedProject = nextProps.project;
			newState.projectsItems = nextProps.projects;
		}

		return newState;
	}

	public state = {
		selectedTeamspace: '',
		projectsItems: [],
		selectedProject: '',
		modelName: '',
		unit: ''
	};

	public componentDidMount() {
		const { modelName } = this.props;

		if (modelName.length) {
			this.setState({ modelName });
		}
	}

	public handleModelSave = (values) => {
		this.props.handleResolve({...values});
	}

	public handleTeamspaceChange = (onChange) => (event, teamspaceName) => {
		this.setState({
			selectedTeamspace: teamspaceName,
			projectsItems: this.getTeamspaceProjects(teamspaceName)
		});

		onChange(event, teamspaceName);
	}

	public handleUnitChange = (onChange) => (event, unit) => {
		this.setState({ unit });

		onChange(event);
	}

	public handleProjectChange = (onChange) => (event, projectName) => {
		this.setState({ selectedProject: projectName });

		onChange(event, projectName);
	}

	public handleNameChange = (onChange) => (event) => {
		this.setState({ modelName: event.currentTarget.value });

		onChange(event);
	}

	public getTeamspaceProjects = (teamspaceName) => {
		const selectedTeamspace = this.props.teamspaces.find((teamspace) => teamspace.value === teamspaceName);
		return selectedTeamspace.projects.map(({ name, models }) => ({ value: name, models }));
	}

	public render() {
		const { teamspace, project, teamspaces, handleClose } = this.props;
		const { modelName, projectsItems, unit } = this.state;

		return (
			<Formik
				initialValues={{ teamspace, project, modelName, unit, desc: '', code: '', type: '' }}
				validationSchema={ModelSchema}
				onSubmit={this.handleModelSave}
			>
				<Form>
					<DialogContent>
						<SelectWrapper fullWidth={true} required={true}>
							<InputLabel shrink htmlFor="teamspace-select">Teamspace</InputLabel>
							<Field name="teamspace" render={({ field, form }) => (
								<CellSelect
									{...field}
									error={Boolean(form.touched.teamspace && form.errors.teamspace)}
									helperText={form.touched.teamspace && (form.errors.teamspace || '')}
									items={teamspaces}
									placeholder="Select teamspace"
									disabled={Boolean(teamspace)}
									disabledPlaceholder={true}
									inputId="teamspace-select"
									value={teamspace}
									onChange={this.handleTeamspaceChange(field.onChange)}
								/>
							)} />
						</SelectWrapper>
						<SelectWrapper fullWidth={true} required={true}>
							<InputLabel shrink htmlFor="project-select">Project</InputLabel>
							<Field name="project" render={({ field, form }) => (
								<CellSelect
									{...field}
									error={Boolean(form.touched.project && form.errors.project)}
									helperText={form.touched.project && (form.errors.project || '')}
									items={projectsItems}
									placeholder="Select project"
									disabled={Boolean(project)}
									disabledPlaceholder={true}
									inputId="project-select"
									value={project}
									onChange={this.handleProjectChange(field.onChange)}
								/>
							)} />
						</SelectWrapper>
						<Row>
							<FieldWrapper>
								<Field name="modelName" render={({ field, form }) => (
									<TextField
										{...field}
										error={Boolean(form.touched.modelName && form.errors.modelName)}
										helperText={form.touched.modelName && (form.errors.modelName || '')}
										label="Model Name"
										margin="normal"
										required
										fullWidth={true}
										value={this.state.modelName}
										onChange={this.handleNameChange(field.onChange)}
									/>
								)} />
							</FieldWrapper>
							<SelectWrapper fullWidth={true} required={true}>
								<InputLabel shrink htmlFor="unit-select">Unit</InputLabel>
								<Field name="unit" render={({ field }) => (
									<CellSelect
										{...field}
										placeholder="Select unit"
										disabledPlaceholder={true}
										required
										items={clientConfigService.units}
										value={unit}
										onChange={this.handleUnitChange(field.onChange)}
										inputId="unit-select"
									/>
								)} />
							</SelectWrapper>
						</Row>
						<Row>
							<FieldWrapper>
								<Field name="code" render={({ field }) => (
									<TextField
										{...field}
										label="Model Code (optional)"
										margin="normal"
										fullWidth={true}
									/>
								)} />
							</FieldWrapper>
							<SelectWrapper fullWidth={true} required={true}>
								<InputLabel shrink htmlFor="type-select">Model Type</InputLabel>
								<Field name="type" render={({ field }) => (
									<CellSelect
										{...field}
										placeholder="Select model type"
										disabledPlaceholder={true}
										items={MODEL_SUBTYPES}
										required
										inputId="type-select"
									/>
								)} />
							</SelectWrapper>
						</Row>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleClose} color="secondary">Cancel</Button>
						<Field render={({ form }) =>
							<Button
								type="submit" variant="raised" color="secondary"
								disabled={(!form.isValid || form.isValidating)}>
								Save
							</Button>
						} />
					</DialogActions>
				</Form>
			</Formik>
		);
	}
}
