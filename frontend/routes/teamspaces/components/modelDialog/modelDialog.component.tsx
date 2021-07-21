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

import { Field, Form, Formik } from 'formik';
import React, { useCallback } from 'react';
import * as Yup from 'yup';

import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';

import { clientConfigService } from '../../../../services/clientConfig';
import { schema } from '../../../../services/validation';
import { CellSelect } from '../../../components/customTable/components/cellSelect/cellSelect.component';

import { getModelCodeFieldErrorMsg, getTeamspacesList, getTeamspaceProjects } from '../../../../helpers/model';
import { MODEL_SUBTYPES } from '../../teamspaces.contants';
import { FieldWrapper, Row, SelectWrapper } from './modelDialog.styles';

const ModelSchema = Yup.object().shape({
	modelName: schema.firstName
			.max(120, 'Model Name is limited to 120 characters')
			.required('Model Name is a required field'),
	teamspace: Yup.string().required(),
	project: Yup.string().required(),
	unit: Yup.string().required(),
	type: Yup.string().required(),
	code: Yup.string().max(50).matches(/^[A-Za-z0-9]+$/)
});

interface IProps {
	teamspaces: any;
	projects: any;
	project?: string;
	teamspace?: string;
	handleResolve: (model) => void;
	handleClose: () => void;
	createModel: (teamspace, data) => void;
}

export const ModelDialog = (props: IProps) => {
	const { teamspaces, projects, handleClose, createModel, project, teamspace } = props;

	const handleModelSave = useCallback((values) => {
		const selectedProject = projects[values.project].name;
		createModel(values.teamspace, { ...values, project: selectedProject });
		handleClose();
	}, [projects, handleClose, createModel]);

	return (
		<Formik
			initialValues={{ project, teamspace }}
			validationSchema={ModelSchema}
			onSubmit={handleModelSave}
		>
			<Form>
				<DialogContent>
					<SelectWrapper fullWidth required>
						<InputLabel shrink htmlFor="teamspace-select">Teamspace</InputLabel>
						<Field name="teamspace" render={ ({ field, form }) => (
							<CellSelect
								{...field}
								error={Boolean(form.touched.teamspace && form.errors.teamspace)}
								helperText={form.touched.teamspace && (form.errors.teamspace || '')}
								items={getTeamspacesList(teamspaces)}
								placeholder="Select teamspace"
								disabledPlaceholder
								inputId="teamspace-select"
							/>
						)} />
					</SelectWrapper>
					<SelectWrapper fullWidth required>
						<InputLabel shrink htmlFor="project-select">Project</InputLabel>
						<Field name="project" render={ ({ field, form }) => (
							<CellSelect
								{...field}
								error={Boolean(form.touched.project && form.errors.project)}
								helperText={form.touched.project && (form.errors.project || '')}
								items={getTeamspaceProjects(form.values.teamspace, teamspaces, projects)}
								placeholder="Select project"
								disabledPlaceholder
								inputId="project-select"
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
									fullWidth
								/>
							)} />
						</FieldWrapper>
						<SelectWrapper fullWidth required>
							<InputLabel shrink htmlFor="unit-select">Unit</InputLabel>
							<Field name="unit" render={({ field }) => (
								<CellSelect
									{...field}
									placeholder="Select unit"
									disabledPlaceholder
									required
									items={clientConfigService.units}
									inputId="unit-select"
								/>
							)} />
						</SelectWrapper>
					</Row>
					<Row>
						<FieldWrapper>
							<Field name="code" render={({ field, form }) => (
								<TextField
									{...field}
									error={Boolean(form.touched.code && form.errors.code)}
									helperText={form.touched.code && getModelCodeFieldErrorMsg(form.errors.code)}
									label="Model Code (optional)"
									margin="normal"
									fullWidth
								/>
							)} />
						</FieldWrapper>
						<SelectWrapper fullWidth required>
							<InputLabel shrink htmlFor="type-select">Model Type</InputLabel>
							<Field name="type" render={ ({ field }) => (
								<CellSelect
									{...field}
									placeholder="Select model type"
									disabledPlaceholder
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
							type="submit"
							variant="contained"
							color="secondary"
							disabled={(!form.isValid || form.isValidating)}>
							Save
						</Button>} />
				</DialogActions>
			</Form>
		</Formik>
	);
};
