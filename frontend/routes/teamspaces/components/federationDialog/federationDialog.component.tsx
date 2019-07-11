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
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import ArrowBack from '@material-ui/icons/ArrowBack';
import ArrowForward from '@material-ui/icons/ArrowForward';
import { Field, Form, Formik } from 'formik';
import { differenceBy, includes, isEmpty } from 'lodash';
import * as React from 'react';
import * as Yup from 'yup';
import {
	getAvailableModels,
	getFederatedModels,
	getModelsMap,
	getNewSelectedModels,
	getProject
} from './federationDialog.helpers';

import { clientConfigService } from '../../../../services/clientConfig';
import { schema } from '../../../../services/validation';
import { CellSelect } from '../../../components/customTable/components/cellSelect/cellSelect.component';
import { LoadingDialog } from './../../../../routes/components/dialogContainer/components';
import { SubModelsField } from './components/subModelsField/subModelsField.component';

import { FieldWrapper, Row, SelectWrapper, StyledDialogContent } from './federationDialog.styles';

const FederationSchema = Yup.object().shape({
	modelName: schema.firstName.min(2).max(120).required(),
	teamspace: Yup.string().required(),
	project: Yup.string().required(),
	unit: Yup.string().required(),
	subModels: Yup.array().required()
});

interface IProps {
	name?: string;
	modelName?: string;
	teamspace?: string;
	project?: string;
	teamspaces: any[];
	projects?: any[];
	handleResolve: (model) => void;
	handleClose: () => void;
	type: string;
	settings: any;
	fetchModelSettings: (teamspace, modelId) => void;
	editMode: boolean;
	isPending: boolean;
	modelId: string;
}

interface IState {
	selectedTeamspace: string;
	selectedProject: string;
	projectsItems: any[];
	name: string;
	unit: string;
	federatedModels: any[];
	availableModels: any[];
	selectedFederatedModels: any[];
	selectedAvailableModels: any[];
	availableMap: any;
}

export class FederationDialog extends React.PureComponent<IProps, IState> {
	public static defaultProps = { name: '', teamspace: '', project: '' };

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
		name: '',
		unit: '',
		federatedModels: [],
		availableModels: [],
		selectedFederatedModels: [],
		selectedAvailableModels: [],
		availableMap: {}
	};

	public componentDidMount() {
		const { editMode, modelId, name, teamspace, fetchModelSettings, project } = this.props;

		if (name.length) {
			this.setState({ name });
		}
		if (editMode) {
			fetchModelSettings(teamspace, modelId);
		}
		if (project) {
			this.setInitialAvailableModels(project);
		}
	}

	public componentDidUpdate(prevProps, prevState) {
		const changes = {} as any;
		const { editMode, settings, projects, project, modelName } = this.props;

		if ((editMode && settings && prevProps.settings !== settings)) {
			changes.unit = settings.properties.unit;
		}

		if (editMode && !prevState.federatedModels.length && !prevState.availableModels.length) {
			const selectedProject = getProject(projects, project);
			const federatedModels = getFederatedModels(selectedProject, modelName);
			const availableModels = differenceBy(this.state.availableModels, federatedModels, 'name');
			const availableMap = getModelsMap(selectedProject);

			changes.federatedModels = federatedModels;
			changes.availableModels = availableModels;
			changes.availableMap = availableMap;
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public handleModelSave = (values) => {
		const subModels = this.state.federatedModels.map((model) => {
			return {
				database: this.state.selectedTeamspace,
				modelIndex: this.state.availableMap[model.name].index,
				model: this.state.availableMap[model.name].id,
				name: model.name
			};
		});
		const federationValues = {
			...values,
			project: this.state.selectedProject,
			teamspace: this.state.selectedTeamspace,
			subModels,
			modelName: values.modelName,
			name: values.modelName,
			federate: true
		};
		this.props.handleResolve(federationValues);
	}

	public handleTeamspaceChange = (onChange) => (event, teamspaceName) => {
		this.setState({
			selectedTeamspace: teamspaceName, projectsItems: this.getTeamspaceProjects(teamspaceName)
		});
		onChange(event, teamspaceName);
	}

	public handleUnitChange = (onChange) => (event, unit) => {
		this.setState({ unit });
		onChange(event);
	}

	public handleProjectChange = (onChange) => (event, projectName) => {
		this.setState({ selectedProject: projectName });
		this.setInitialAvailableModels(projectName);
		onChange(event, projectName);
	}

	public setInitialAvailableModels = (projectName) => {
		const selectedProject = getProject(this.state.projectsItems, projectName);
		const availableModels = getAvailableModels(selectedProject);
		const availableMap = getModelsMap(selectedProject);

		this.setState({
			availableMap, availableModels, federatedModels: [], selectedAvailableModels: [], selectedFederatedModels: []
		});
	}

	public handleNameChange = (onChange) => (event) => {
		this.setState({ name: event.currentTarget.value });
		onChange(event);
	}

	public getTeamspaceProjects = (teamspaceName) => {
		const selectedTeamspace = this.props.teamspaces.find((teamspace) => teamspace.value === teamspaceName);
		return selectedTeamspace.projects.map(({ name, models }) => ({ value: name, models }));
	}

	public handleSelectAllAvailableClick = (event) => {
		if (event.target.checked) {
			this.setState((state) =>
				({ selectedAvailableModels: state.availableModels.map((model) => model.name) }));
			return;
		}
		this.setState({
			selectedAvailableModels: []
		});
	}

	public handleSelectAllFederatedClick = (event) => {
		if (event.target.checked) {
			this.setState((state) =>
				({ selectedFederatedModels: state.federatedModels.map((model) => model.name) }));
			return;
		}
		this.setState({
			selectedFederatedModels: []
		});
	}

	public moveToFederated = () => {
		const federatedModels = this.state.selectedAvailableModels.map((modelName) => {
			return { name: modelName };
		});

		const availableModels = this.state.availableModels.filter((model) =>
			!includes(this.state.selectedAvailableModels, model.name)
		);

		this.setState({
			federatedModels: this.state.federatedModels.concat(federatedModels),
			selectedAvailableModels: [],
			selectedFederatedModels: [],
			availableModels
		});
	}

	public moveToAvailable = () => {
		const availableModels = this.state.selectedFederatedModels.map((modelName) => {
			return { name: modelName };
		});

		const federatedModels = this.state.federatedModels.filter((model) =>
			!includes(this.state.selectedFederatedModels, model.name)
		);

		this.setState({
			availableModels: this.state.availableModels.concat(availableModels),
			selectedFederatedModels: [],
			selectedAvailableModels: [],
			federatedModels
		});
	}

	public handleSelectAvailableItemClick = (event, name) => {
		const newSelected = getNewSelectedModels(this.state.selectedAvailableModels, name);
		this.setState({ selectedAvailableModels: newSelected });
	}

	public handleSelectFederatedItemClick = (event, name) => {
		const newSelected = getNewSelectedModels(this.state.selectedFederatedModels, name);
		this.setState({ selectedFederatedModels: newSelected });
	}

	public render() {
		const { modelName, teamspace, project, teamspaces, handleClose, editMode, isPending } = this.props;
		const { name, projectsItems, selectedProject, unit, availableModels, federatedModels,
			selectedFederatedModels, selectedAvailableModels } = this.state;

		if (editMode && isPending) {
			return (<LoadingDialog content={`Loading ${modelName} data...`} />);
		}

		return (
			<Formik
				initialValues={{ teamspace, project, name, modelName, unit, desc: '', subModels: federatedModels }}
				validationSchema={FederationSchema}
				onSubmit={this.handleModelSave}
			>
				<Form>
					<StyledDialogContent>
						<SelectWrapper fullWidth={true} required={true}>
							<InputLabel shrink={true} htmlFor="teamspace-select">Teamspace</InputLabel>
							<Field name="teamspace" render={ ({ field, form }) => (
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
							<InputLabel shrink={true} htmlFor="project-select">Project</InputLabel>
							<Field name="project" render={ ({ field, form }) => (
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
								<Field name="modelName" render={ ({ field, form }) => (
									<TextField
										{...field}
										error={Boolean(form.touched.name && form.errors.name)}
										helperText={form.touched.name && (form.errors.name || '')}
										label="Federation Name"
										margin="normal"
										disabled={editMode}
										required={true}
										fullWidth={true}
										value={this.state.name}
										onChange={this.handleNameChange(field.onChange)}
									/>
								)} />
							</FieldWrapper>
							<SelectWrapper fullWidth={true} required={true}>
								<InputLabel shrink={true} htmlFor="unit-select">Unit</InputLabel>
								<Field name="unit" render={ ({ field }) => (
									<CellSelect
										{...field}
										placeholder="Select unit"
										disabledPlaceholder={true}
										required={true}
										items={clientConfigService.units}
										value={unit}
										disabled={editMode}
										onChange={this.handleUnitChange(field.onChange)}
										inputId="unit-select"
									/>
								)} />
							</SelectWrapper>
						</Row>
						<Field name="subModels" render={ ({ field }) =>
							<SubModelsField
								{...field}
								availableModels={availableModels}
								selectedAvailableModels={selectedAvailableModels}
								selectedFederatedModels={selectedFederatedModels}
								federatedModels={federatedModels}
								availableIcon={ArrowForward}
								federatedIcon={ArrowBack}
								checkboxDisabled={!selectedProject}
								moveToFederated={this.moveToFederated}
								moveToAvailable={this.moveToAvailable}
								handleSelectAllAvailableClick={this.handleSelectAllAvailableClick}
								handleSelectAvailableItemClick={this.handleSelectAvailableItemClick}
								handleSelectAllFederatedClick={this.handleSelectAllFederatedClick}
								handleSelectFederatedItemClick={this.handleSelectFederatedItemClick}
							/>} />
					</StyledDialogContent>
					<DialogActions>
						<Button onClick={handleClose} color="secondary">Cancel</Button>
						<Field render={ ({ form }) =>
							<Button
								type="submit"
								variant="raised"
								color="secondary"
								disabled={(!form.isValid || form.isValidating)}
							>Save</Button>} />
					</DialogActions>
				</Form>
			</Formik>
		);
	}
}
