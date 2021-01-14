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
import { differenceBy, includes, isEmpty, values } from 'lodash';
import React from 'react';
import * as Yup from 'yup';
import {
	getAvailableModels,
	getFederatedModels,
	getModelsMap,
	getNewSelectedModels,
} from './federationDialog.helpers';

import { clientConfigService } from '../../../../services/clientConfig';
import { schema } from '../../../../services/validation';
import { CellSelect } from '../../../components/customTable/components/cellSelect/cellSelect.component';
import { LoadingDialog } from '../../../components/dialogContainer/components';
import { SubModelsField } from './components/subModelsField/subModelsField.component';

import { getTeamspacesList, getTeamspaceProjects } from '../../../../helpers/model';
import { FieldWrapper, Row, SelectWrapper, StyledDialogContent } from './federationDialog.styles';

const FederationSchema = Yup.object().shape({
	modelName: schema.firstName
			.max(120, 'Federation Name is limited to 120 characters')
			.required('Federation Name is a required field'),
	teamspace: Yup.string().required(),
	projectName: Yup.string().required(),
	unit: Yup.string().required(),
	subModels: Yup.array().required()
});

interface IProps {
	name?: string;
	modelName?: string;
	teamspace?: string;
	teamspaces: any[];
	project?: string;
	projects?: any[];
	models?: any[];
	federations?: any[];
	type: string;
	settings: any;
	editMode: boolean;
	isPending: boolean;
	modelId: string;
	fetchModelSettings: (teamspace, modelId) => void;
	handleClose: () => void;
	createModel: (teamspace, data) => void;
	updateModel: (teamspace, id, data) => void;
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

const getModelsName = (models) => models.map(({ name}) => name);

export class FederationDialog extends React.PureComponent<IProps, IState> {
	public static defaultProps = {
		name: '',
		teamspace: '',
		project: ''
	};

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
		const changes = {} as IState;

		if (name.length) {
			changes.name = name;
		}

		if (teamspace) {
			changes.selectedTeamspace = teamspace;
		}

		if (editMode) {
			fetchModelSettings(teamspace, modelId);
		}
		if (project) {
			changes.selectedProject = project;
			this.setInitialAvailableModels(teamspace, project);
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public componentDidUpdate(prevProps, prevState) {
		const changes = {} as any;
		const { editMode, settings, projects, project, modelName, models } = this.props;

		if ((editMode && settings && prevProps.settings !== settings)) {
			changes.unit = settings.properties.unit;
		}

		if (editMode && !prevState.federatedModels.length && !prevState.availableModels.length) {
			const selectedProject = projects[project];
			const federatedModels = getFederatedModels(selectedProject, modelName, models);
			const availableModels = differenceBy(this.state.availableModels, federatedModels, 'name');
			const availableMap = getModelsMap(this.state.availableModels);

			changes.federatedModels = federatedModels;
			changes.availableModels = availableModels;
			changes.availableMap = availableMap;
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	private get projectName() {
		return (this.props.projects[this.props.project] || {}).name;
	}

	public handleModelSave = (fedValues) => {
		const { modelId, editMode, projects, createModel, updateModel, handleClose } = this.props;
		const { selectedTeamspace, availableMap, federatedModels, selectedProject } = this.state;
		const subModels = federatedModels.map((model) => ({
			database: selectedTeamspace,
			modelIndex: availableMap[model.name].index,
			model: availableMap[model.name].model,
			name: model.name
		}));

		const federationValues = {
			project: projects[selectedProject].name,
			subModels,
			modelName: fedValues.modelName,
			name: fedValues.modelName,
			unit: fedValues.unit,
			federate: true
		};

		if (!editMode) {
			createModel(selectedTeamspace, federationValues);
		} else {
			updateModel(selectedTeamspace, modelId, federationValues);
		}

		handleClose();
	}

	public handleTeamspaceChange = (field) => (event, teamspaceName) => {
		const { teamspaces, projects } = this.props;
		this.setState({
			selectedTeamspace: teamspaceName,
			projectsItems: getTeamspaceProjects(teamspaceName, teamspaces, projects)
		});
		field.onChange(event, teamspaceName);
	}

	public handleUnitChange = (onChange) => (event, unit) => {
		this.setState({ unit });
		onChange(event);
	}

	public handleProjectChange = (onChange) => (event, projectName) => {
		this.setState({ selectedProject: projectName });
		this.setInitialAvailableModels(this.state.selectedTeamspace, projectName);
		onChange(event, projectName);
	}

	public setInitialAvailableModels = (teamspace, project) => {
		const { projects, models, teamspaces } = this.props;
		const projectsItems = getTeamspaceProjects(teamspace, teamspaces, projects);
		const availableModels = getAvailableModels(projects[project], models);
		const availableMap = getModelsMap(availableModels);

		this.setState({
			projectsItems,
			availableMap,
			availableModels,
			federatedModels: [],
			selectedAvailableModels: [],
			selectedFederatedModels: []
		});
	}

	public handleSelectAllAvailableClick = (event) => {
		const isChecked = event.target.checked;
		this.setState((state) => ({
			selectedAvailableModels: getModelsName(isChecked ? state.availableModels : [])
		}));
	}

	public handleSelectAllFederatedClick = (event) => {
		const isChecked = event.target.checked;
		this.setState((state) => ({
			selectedFederatedModels: getModelsName(isChecked ? state.federatedModels : [])
		}));
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
		const { modelName, teamspace, teamspaces, handleClose, editMode, isPending } = this.props;
		const {
			projectsItems, selectedProject, unit, availableModels, federatedModels,
			selectedFederatedModels, selectedAvailableModels
		} = this.state;

		if (editMode && isPending) {
			return (<LoadingDialog content={`Loading ${modelName} data...`} />);
		}

		return (
			<Formik
				initialValues={{
					teamspace,
					projectName: this.projectName,
					modelName,
					unit,
					desc: '',
					subModels: federatedModels
				}}
				validationSchema={FederationSchema}
				onSubmit={this.handleModelSave}
			>
				<Form>
					<StyledDialogContent>
						<SelectWrapper fullWidth required>
							<InputLabel shrink htmlFor="teamspace-select">Teamspace</InputLabel>
							<Field name="teamspace" render={ ({ field, form }) => (
								<CellSelect
									{...field}
									error={Boolean(form.touched.teamspace && form.errors.teamspace)}
									helperText={form.touched.teamspace && (form.errors.teamspace || '')}
									items={getTeamspacesList(teamspaces)}
									placeholder="Select teamspace"
									disabled={editMode}
									disabledPlaceholder
									inputId="teamspace-select"
									value={teamspace}
									onChange={this.handleTeamspaceChange(field)}
								/>
							)} />
						</SelectWrapper>
						<SelectWrapper fullWidth required>
							<InputLabel shrink htmlFor="project-select">Project</InputLabel>
							<Field name="projectName" render={ ({ field, form }) => (
								<CellSelect
									{...field}
									error={Boolean(form.touched.projectName && form.errors.projectName)}
									helperText={form.touched.projectName && (form.errors.projectName || '')}
									items={projectsItems}
									placeholder="Select project"
									disabled={editMode}
									disabledPlaceholder
									inputId="project-select"
									value={selectedProject}
									onChange={this.handleProjectChange(field.onChange)}
								/>
							)} />
						</SelectWrapper>
						<Row>
							<FieldWrapper>
								<Field name="modelName" render={ ({ field, form }) => (
									<TextField
										{...field}
										error={Boolean(form.touched.modelName && form.errors.modelName)}
										helperText={form.touched.modelName && (form.errors.modelName || '')}
										label="Federation Name"
										margin="normal"
										disabled={editMode}
										required
										fullWidth
									/>
								)} />
							</FieldWrapper>
							<SelectWrapper fullWidth required>
								<InputLabel shrink htmlFor="unit-select">Unit</InputLabel>
								<Field name="unit" render={ ({ field }) => (
									<CellSelect
										{...field}
										placeholder="Select unit"
										disabledPlaceholder
										required
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
								variant="contained"
								color="secondary"
								disabled={(!form.isValid || form.isValidating)}
							>Save</Button>} />
					</DialogActions>
				</Form>
			</Formik>
		);
	}
}
