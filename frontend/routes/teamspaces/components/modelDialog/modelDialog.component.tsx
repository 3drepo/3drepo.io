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
import { clientConfigService } from '../../../../services/clientConfig';
import { schema } from '../../../../services/validation';
import { CellSelect } from '../../../components/customTable/components/cellSelect/cellSelect.component';
import { Row, SelectWrapper,	FieldWrapper,	ModelsTableContainer } from './modelDialog.styles';

import { SubModelsTable } from '../../components/subModelsTable/subModelsTable.component';

import { MODEL_TYPE, FEDERATION_TYPE, MODEL_SUBTYPES } from './../../teamspaces.contants';

const ModelSchema = Yup.object().shape({
	name: schema.firstName.max(120),
	teamspace: Yup.string().required(),
	project: Yup.string().required()
});

const commonInitialValues = {
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

const getAvailableModels = (project) => project.models.filter((model) => !model.federate).map(({ name }) => ({ name }));
const getProject = (projectItems, projectName) => projectItems.find((project) => project.value === projectName);

interface IProps {
	name?: string;
	teamspace?: string;
	project?: string;
	teamspaces: any[];
	projects?: any[];
	handleResolve: (model) => void;
	handleClose: () => void;
	type: string;
}

interface IState {
	selectedTeamspace: string;
	selectedProject: string;
	projectsItems: any[];
	name: string;
	federatedModels: any[];
	availableModels: any [];
	selectedFederatedModels: any[];
	selectedAvailableModels: any[];
}

export class ModelDialog extends React.PureComponent<IProps, IState> {
	public static defaultProps = {
		name: '',
		teamspace: '',
		project: ''
	};

	public static getDerivedStateFromProps(nextProps: IProps) {
		if (Boolean(nextProps.project) && Boolean(nextProps.projects)) {
			const selectedProject = getProject(nextProps.projects, nextProps.project);
			const availableModels = getAvailableModels(selectedProject);

			return {
				selectedProject: nextProps.project,
				projectsItems: nextProps.projects,
				availableModels,
				federatedModels: [],
				selectedAvailableModels: [],
				selectedFederatedModels: []
			};
		}
		return {};
	}

	public state = {
		selectedTeamspace: '',
		projectsItems: [],
		selectedProject: '',
		name: '',
		federatedModels: [],
		availableModels: [],
		selectedFederatedModels: [],
		selectedAvailableModels: []
	};

	public handleModelSave = (values) => {
		this.props.handleResolve(values);
	}

	public handleTeamspaceChange = (onChange) => (event, teamspaceName) => {
		this.setState({
			selectedTeamspace: teamspaceName,
			projectsItems: this.getTeamspaceProjects(teamspaceName)
		});
		onChange(event, teamspaceName);
	}

	public handleProjectChange = (onChange) => (event, projectName) => {
		this.setState({
			selectedProject: projectName
		});

		if (this.props.type === FEDERATION_TYPE) {
			const selectedProject = getProject(this.state.projectsItems, projectName);
			const availableModels = getAvailableModels(selectedProject);

			this.setState({
				availableModels,
				federatedModels: [],
				selectedAvailableModels: [],
				selectedFederatedModels: []
			});
		}
		onChange(event, projectName);
	}

	public handleNameChange = (onChange) => (event) => {
		this.setState({ name: event.currentTarget.value });
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
					title={'Available'}
					models={availableModels}
					selectedModels={selectedAvailableModels}
					handleIconClick={this.moveToFederated}
					icon={'arrow_forward'}
					handleAllClick={this.handleSelectAllAvailableClick}
					handleItemClick={this.handleSelectAvailableItemClick}
					checkboxDisabled={!this.state.selectedProject}
				/>
				<SubModelsTable
					title={'Federated'}
					models={federatedModels}
					selectedModels={selectedFederatedModels}
					handleIconClick={this.moveToAvailable}
					icon={'arrow_back'}
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
	};

	public handleSelectAllFederatedClick = (event) => {
		if (event.target.checked) {
			this.setState((state) =>
				({ selectedFederatedModels: state.federatedModels.map((model) => model.name) }));
			return;
		}
		this.setState({
			selectedFederatedModels: []
		});
	};

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
				selectedModels.slice(selectedIndex + 1),
			);
		}

		return newSelected;
	}

	public moveToFederated = () => {
		const federatedModels = this.state.selectedAvailableModels.map((modelName) => {
			return { name: modelName };
		});

		const availableModels = this.state.availableModels.filter((model) =>
			!this.state.selectedAvailableModels.includes(model.name)
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
			!this.state.selectedFederatedModels.includes(model.name)
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
								items={MODEL_SUBTYPES}
								inputId="type-select"
							/>
						)} />
					</SelectWrapper>
				</Row>
			</>
		);
	}

	public render() {
		const { name, teamspace, project, teamspaces, handleClose, type, projects } = this.props;
		const { projectsItems, name: typedName, selectedTeamspace, selectedProject } = this.state;

		return (
			<Formik
				initialValues={
					{
						teamspace: teamspace ? teamspace : selectedTeamspace,
						project: project ? project : selectedProject,
						name,
						...commonInitialValues,
						...dataByType[type].initialValues
					}
				}
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
											required
											fullWidth={true}
											onChange={this.handleNameChange(field.onChange)}
										/>
									)} />
								</FieldWrapper>
								<SelectWrapper fullWidth={true} required={true}>
									<InputLabel shrink htmlFor="unit-select">Unit</InputLabel>
									<Field name="unit" render={({ field, form }) => (
										<CellSelect
											{...field}
											items={clientConfigService.units}
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
						<Field render={({ form }) => (
							<Button
								type="submit"
								variant="raised"
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
