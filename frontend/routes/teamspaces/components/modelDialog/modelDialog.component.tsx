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
import { isEmpty } from 'lodash';
import { Formik, Form, Field } from 'formik';
import { upperFirst, mapValues, keyBy, includes, differenceBy } from 'lodash';

import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import ArrowForward from '@material-ui/icons/ArrowForward';
import ArrowBack from '@material-ui/icons/ArrowBack';

import { clientConfigService } from '../../../../services/clientConfig';
import { schema } from '../../../../services/validation';
import { CellSelect } from '../../../components/customTable/components/cellSelect/cellSelect.component';
import { SubModelsTable } from '../../components/subModelsTable/subModelsTable.component';
import { LoadingDialog }
	from '../../../../routes/components/dialogContainer/components/loadingDialog/loadingDialog.component';

import { Row, SelectWrapper, FieldWrapper, ModelsTableContainer } from './modelDialog.styles';

import { MODEL_TYPE, FEDERATION_TYPE, MODEL_SUBTYPES } from './../../teamspaces.contants';

const commonSchemaValues = {
	name: schema.firstName.max(120).required(),
	teamspace: Yup.string().required(),
	project: Yup.string().required(),
	unit: Yup.string().required()
};

const ModelSchema = Yup.object().shape({
	...commonSchemaValues,
	type: Yup.string().required()
});

const FederationSchema = Yup.object().shape({
	...commonSchemaValues
});

const dataByType = {
	[MODEL_TYPE]: {
		initialValues: {
			code: '',
			type: ''
		}
	},
	[FEDERATION_TYPE]: {
		initialValues: {
			name: '',
			subModels: []
		}
	}
};

const getAvailableModels = (project) =>
	project.models.filter((model) => !model.federate).map(({ name }) => ({ name }));

const getFederatedModels = (project, name) =>
	project.models.find((model) => model.name === name).subModels.map((subModel) => {
		return { name: subModel.name };
	});

const getModelsMap = (project) => {
	const availableModels = project.models.filter((model) => !model.federate)
	.map((model, index) => {
		model.index = index;
		return model;
	});

	return mapValues(keyBy(availableModels, 'name'), (model) => {
		return {
			id: model.model,
			index: model.index
		};
	});
};

const getProject = (projectItems, projectName) => projectItems.find((project) => project.value === projectName);

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
	availableModels: any [];
	selectedFederatedModels: any[];
	selectedAvailableModels: any[];
	availableMap: any;
}

export class ModelDialog extends React.PureComponent<IProps, IState> {
	public static defaultProps = {
		name: '',
		teamspace: '',
		project: ''
	};

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
		const { editMode, modelId, name, teamspace, fetchModelSettings, project, type } = this.props;

		if (name.length) {
			this.setState({ name });
		}

		if (editMode) {
			fetchModelSettings(teamspace, modelId);
		}

		if (project && type === FEDERATION_TYPE) {
			this.setInitialAvailableModels(project);
		}
	}

	public componentDidUpdate(prevProps, prevState) {
		const changes = {} as any;
		const { editMode, settings, type, projects, project, modelName } = this.props;

		if ((editMode && settings && prevProps.settings !== settings)) {
			changes.unit = settings.properties.unit;
		}

		if (editMode && type === FEDERATION_TYPE && !prevState.federatedModels.length && !prevState.availableModels.length) {
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
		const { type, handleResolve } = this.props;

		if (type === FEDERATION_TYPE) {
			const subModels = this.state.federatedModels.map((model) => {
				return {
					name: model.name,
					database: this.state.selectedTeamspace,
					modelIndex: this.state.availableMap[model.name].index,
					model: this.state.availableMap[model.name].id
				};
			});

			const federationValues = {
				...values,
				project: this.state.selectedProject,
				teamspace: this.state.selectedTeamspace,
				subModels,
				modelName: values.name
			};

			handleResolve(federationValues);
		} else {
			const modelValues = {
				...values,
				modelName: values.name
			};
			handleResolve(modelValues);
		}
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
		this.setState({
			selectedProject: projectName
		});

		if (this.props.type === FEDERATION_TYPE) {
			this.setInitialAvailableModels(projectName);
		}

		onChange(event, projectName);
	}

	public setInitialAvailableModels = (projectName) => {
		const selectedProject = getProject(this.state.projectsItems, projectName);
		const availableModels = getAvailableModels(selectedProject);
		const availableMap = getModelsMap(selectedProject);

		this.setState({
			availableModels,
			federatedModels: [],
			selectedAvailableModels: [],
			selectedFederatedModels: [],
			availableMap
		});
	}

	public handleNameChange = (onChange) => (event) => {
		this.setState({
			name: event.currentTarget.value
		});
		onChange(event);
	}

	public getTeamspaceProjects = (teamspaceName) => {
		const selectedTeamspace = this.props.teamspaces.find((teamspace) => teamspace.value === teamspaceName);
		return selectedTeamspace.projects.map(({ name, models }) => ({ value: name, models }));
	}

	public renderFederationFields = () => {
		const { availableModels, federatedModels, selectedFederatedModels, selectedAvailableModels } = this.state;

		return (
			<ModelsTableContainer>
				<SubModelsTable
					title="Available"
					models={availableModels}
					selectedModels={selectedAvailableModels}
					handleIconClick={this.moveToFederated}
					Icon={ArrowForward}
					handleAllClick={this.handleSelectAllAvailableClick}
					handleItemClick={this.handleSelectAvailableItemClick}
					checkboxDisabled={!this.state.selectedProject}
				/>
				<SubModelsTable
					title="Federated"
					models={federatedModels}
					selectedModels={selectedFederatedModels}
					handleIconClick={this.moveToAvailable}
					Icon={ArrowBack}
					handleAllClick={this.handleSelectAllFederatedClick}
					handleItemClick={this.handleSelectFederatedItemClick}
					checkboxDisabled={!this.state.selectedProject}
				/>
			</ModelsTableContainer>
		);
	}

	public renderOtherFields = (type) => {
		if (type === FEDERATION_TYPE) {
			return this.renderFederationFields();
		} else if (type === MODEL_TYPE) {
			return this.renderModelFields();
		}
	}

	public isSelected = (list, name) => list.indexOf(name) !== -1;

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

	public getNewSelectedModels = (selectedModels, name) => {
		const selectedIndex = selectedModels.indexOf(name);
		let newSelected = [];

		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selectedModels, name);
		} else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selectedModels.slice(1));
		} else if (selectedIndex === selectedModels.length - 1) {
			newSelected = newSelected.concat(selectedModels.slice(0, -1));
		} else if (selectedIndex > 0) {
			newSelected = newSelected.concat(
				selectedModels.slice(0, selectedIndex),
				selectedModels.slice(selectedIndex + 1)
			);
		}

		return newSelected;
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
		const newSelected = this.getNewSelectedModels(this.state.selectedAvailableModels, name);
		this.setState({ selectedAvailableModels: newSelected });
	}

	public handleSelectFederatedItemClick = (event, name) => {
		const newSelected = this.getNewSelectedModels(this.state.selectedFederatedModels, name);
		this.setState({ selectedFederatedModels: newSelected });
	}

	public renderModelFields = () => {
		return (
			<>
				<Row>
					<FieldWrapper>
						<Field name="code" render={({ field, form }) => (
							<TextField
								{...field}
								label={`Model Code (optional)`}
								margin="normal"
								fullWidth={true}
							/>
						)} />
					</FieldWrapper>

					<SelectWrapper fullWidth={true} required={true}>
						<InputLabel shrink htmlFor="type-select">Model Type</InputLabel>
						<Field name="type" render={({ field, form }) => (
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
			</>
		);
	}

	public render() {
		const { modelName, teamspace, project, teamspaces, handleClose, type, editMode, isPending } = this.props;
		const { name, projectsItems, selectedTeamspace, selectedProject, unit, federatedModels } = this.state;

		if (editMode && isPending) {
			return (
				<LoadingDialog content={`Loading ${modelName} data...`} />
			);
		}

		return (
			<Formik
				initialValues={
					{
						teamspace: teamspace ? teamspace : selectedTeamspace, project: project ? project : selectedProject,
						name, modelName, unit, desc: '', ...dataByType[type].initialValues
					}
				}
				validationSchema={type === FEDERATION_TYPE ? FederationSchema : ModelSchema}
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
						<>
							<Row>
								<FieldWrapper>
									<Field name="name" render={({ field, form }) => (
										<TextField
											{...field}
											error={Boolean(form.touched.name && form.errors.name)}
											helperText={form.touched.name && (form.errors.name || '')}
											label={`${upperFirst(type)} Name`}
											margin="normal"
											disabled={editMode}
											required
											fullWidth={true}
											value={this.state.name}
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
											disabled={editMode}
											onChange={this.handleUnitChange(field.onChange)}
											inputId="unit-select"
										/>
									)} />
								</SelectWrapper>
							</Row>
							{ this.renderOtherFields(type) }
						</>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleClose} color="secondary">Cancel</Button>
						<Field render={({ form }) => {
							return (
								<Button
									type="submit"
									variant="raised"
									color="secondary"
									disabled={(!form.isValid || form.isValidating)}>Save</Button>
							);
						}
						} />
					</DialogActions>
				</Form>
			</Formik>
		);
	}
}
