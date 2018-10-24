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
import { upperFirst, pick, isEmpty, merge, mapValues, keyBy, map } from 'lodash';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

import { clientConfigService } from '../../../../services/clientConfig';
import { schema } from '../../../../services/validation';
import { CellSelect } from '../../../components/customTable/components/cellSelect/cellSelect.component';
import {
	StyledField, Row, SelectWrapper, FieldWrapper, ModelsTableContainer, StyledTableButton
} from './modelDialog.styles';
import {
	CELL_TYPES, CustomTable, CheckboxField, TableButton
} from '../../../components/customTable/customTable.component';

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
	available: any[];
	federated: any;
	availableRows: any[];
	federatedRows: any[];
	selectedAvailable: any[];
	selectedFederated: any[];
}

export class ModelDialog extends React.PureComponent<IProps, IState> {
	public static defaultProps = {
		name: '',
		teamspace: '',
		project: ''
	};

	public static getDerivedStateFromProps(nextProps: IProps, prevState) {
		if (Boolean(nextProps.project)) {
			return {
				selectedProject: nextProps.project ? nextProps.project : '',
				projectsItems: nextProps.projects ? nextProps.projects : []
			};
		}
		return {};
	}

	public state = {
		selectedTeamspace: '',
		projectsItems: [],
		selectedProject: '',
		name: '',
		available: [],
		federated: {},
		availableRows: [],
		federatedRows: [],
		selectedAvailable: [],
		selectedFederated: []
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
		this.setState({ selectedProject: projectName });

		if (this.props.type === FEDERATION_TYPE) {
			const selectedProject = this.state.projectsItems.find((project) => project.value === projectName);
			const availableModels = selectedProject.models.filter((model) => !model.federate).map(({ name }) => ({ name }));

			this.setState({
				available: availableModels,
				availableRows: this.getModelsTableRows(availableModels, this.state.selectedAvailable)
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

	public getModelsTableRows = (models = [], selectedModels = []) => {
		return models.map((model) => {
			const data = [
				{ value: model.name }
			];

			const selected = selectedModels.some((selectedModel) => model.name === selectedModel.name);
			return { data, name: model.name, selected };
		});
	}

	public moveToFederated = () => {
		const deselectedAvailableRows = this.state.availableRows.filter((row) => !row.selected);

		this.setState({
			federatedRows: this.state.selectedAvailable,
			selectedAvailable: [],
			availableRows: deselectedAvailableRows
		});
	}

	public moveToAvailable = () => {};

	public getModelCells = (name, icon, onClickHandler) => {
		return [
			{
				name,
				HeadingProps: {
					component: {
						hideSortIcon: true
					}
				}
			},
			{
				type: CELL_TYPES.ICON_BUTTON,
				HeadingComponent: StyledTableButton,
				HeadingProps: {
					component: {
						hideSortIcon: true,
						icon,
						onClick: onClickHandler
					},
					disabled: false
				}
			}
		];
	}

	public handleAvailableSelectionChange = (selectedRows) => {
		this.setState({
			selectedAvailable: selectedRows,
			availableRows: this.getModelsTableRows(this.state.available, selectedRows),
		});
	}

	public handleFederatedSelectionChange = (selectedRows) => {
		this.setState({
			selectedFederated: selectedRows
		});
	}

	public renderFederationFields = () => {
		return (
			<ModelsTableContainer>
				<CustomTable
					cells={this.getModelCells('Available', 'arrow_forward', this.moveToFederated)}
					rows={this.state.availableRows}
					onSelectionChange={this.handleAvailableSelectionChange}
					rowStyle={{ border: 'none', height: '36px' }}
					checkboxDisabled={!this.state.selectedProject}
				/>
				<CustomTable
					cells={this.getModelCells('Federated', 'arrow_back', this.moveToAvailable)}
					rows={this.state.federatedRows}
					onSelectionChange={this.handleFederatedSelectionChange}
					rowStyle={{ border: 'none', height: '36px' }}
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
							);
						}} />
					</DialogActions>
				</Form>
			</Formik>
		);
	}
}
