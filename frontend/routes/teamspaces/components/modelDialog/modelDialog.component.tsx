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
import { upperFirst, pick } from 'lodash';
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
	StyledField, Row, SelectWrapper, FieldWrapper, ModelsTableContainer, StyledCustomTable
} from './modelDialog.styles';
import { CELL_TYPES, CustomTable, CheckboxField } from '../../../components/customTable/customTable.component';


import { MODEL_TYPE, FEDERATION_TYPE } from './../../teamspaces.contants';
import { FEDERATION_TYPE } from '../../teamspaces.contants';

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

const modelTypes = [
	{ value: "Architectural" },
	{ value: "Structural" },
	{ value: "Mechanical" },
	{ value: "GIS" },
	{ value: "Other"}
];

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
	availableSubModels: any[];
	federatedSubModels: any[];
	availableSubModelsRows: any[];
	federatedSubModelsRows: any[];
	selectedAvailableSubModels: any[];
	selectedFederatedSubModels: any[];
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
		name: '',
		availableSubModels: [],
		federatedSubModels: [],
		availableSubModelsRows: [],
		federatedSubModelsRows: [],
		selectedAvailableSubModels: [],
		selectedFederatedSubModels: []
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
			const availableSubModels = this.getAvailableSubModels(projectName);
			console.log('availableSubModels', availableSubModels);
			this.setState({
				availableSubModels,
				availableSubModelsRows: this.getModelsTableRows(availableSubModels)
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
		return selectedTeamspace.projects.map(({ name, models }) => ({
			value: name,
			models
		}));
	}

	public getAvailableSubModels = (projectName) => {
		const selectedProject = this.state.projectsItems.find(project => project.value === projectName);

		console.log('selectedProject', selectedProject)
		return selectedProject.models.filter(model => model.federate).map(({ name, subModels }) => ({
			name, subModels
		}));
	}

	public addToAvailableSubModels = (name) => {
	}

	public addToFederatedSubModels = (name) => {
	}

	public handleAvailableSelectionChange = (availableSubModelsRows) => {
		this.setState({ selectedAvailableSubModels: availableSubModelsRows });
	}

	public renderCustomCheckbox = (props, row) => {
		return <CheckboxField {...props} />;
	}

	public getModelsTableRows = (models = [], selectedModels = []) => {

		return [];
	}

	public renderFederationFields = () => {
		const availableRows = [
			{ data: [ {value: 'a'}]},
			{ data: [ {value: 'b'}]},
			{ data: [ {value: 'c'}]},
			{ data: [ {value: 'd'}]},
			{ data: [ {value: 'e'}]}
		];
		const federatedRows = [
			{ data: [ {value: 'e'}]},
			{ data: [ {value: 'f'}]},
			{ data: [ {value: 'g'}]},
			{ data: [ {value: 'h'}]},
			{ data: [ {value: 'i'}]}
		];

		return (
			<ModelsTableContainer>
				<StyledCustomTable
					cells={[{
						name: 'Available', HeadingProps: { component: { hideSortIcon: true } }}]
					}
					rows={availableRows}
					onSelectionChange={this.handleAvailableSelectionChange}
					renderCheckbox={this.renderCustomCheckbox}
					rowStyle={{ border: 'none', height: '36px' }}
				/>
				<StyledCustomTable
					cells={[{
						name: 'Federated', HeadingProps: { component: { hideSortIcon: true } }}]
					}
					rows={federatedRows}
					onSelectionChange={this.handleAvailableSelectionChange}
					renderCheckbox={this.renderCustomCheckbox}
					rowStyle={{ border: 'none', height: '36px' }}
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
								items={modelTypes}
								inputId="type-select"
							/>
						)} />
					</SelectWrapper>
				</Row>
			</>
		);
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
						<SelectWrapper fullWidth={true} required={true}>
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
						</SelectWrapper>

						{
							// this.state.selectedTeamspace &&
								<SelectWrapper fullWidth={true} required={true}>
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
								</SelectWrapper>
						}

						{
							// this.state.selectedProject &&
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
												// value={clientConfigService.units[1].value}
												/>
											)} />
										</SelectWrapper>
									</Row>
									{
										// typedName &&
										this.renderOtherFields(type)
									}
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
							);
						}} />
					</DialogActions>
				</Form>
			</Formik>
		);
	}
}
