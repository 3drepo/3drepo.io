/**
 *  Copyright (C) 2019 3D Repo Ltd
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
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { Field, FieldArray, Form, Formik } from 'formik';
import React from 'react';
import * as yup from 'yup';
import { map, omit, values } from 'lodash';

import { MODEL_ROLES_LIST } from '../../../constants/model-permissions';
import { renderWhenTrue } from '../../../helpers/rendering';
import { useList } from '../../../hooks';
import { schema } from '../../../services/validation';
import { CellSelect } from '../customTable/components/cellSelect/cellSelect.component';
import { JobItem } from '../jobItem/jobItem.component';
import { PermissionsTable, PermissionsTableContexts } from '../permissionsTable/permissionsTable.component';
import { Container, TextField } from './invitationDialog.styles';

const invitationSchema = yup.object().shape({
	email: schema.email,
	job: yup.string(),
});

interface IProps {
	className?: string;
	email?: string;
	job?: string;
	isAdmin?: boolean;
	jobs: any[];
	projects: any[];
}

export const InvitationDialog = (props: IProps) => {
	const handleSubmit = (values) => {
		console.log('Submit', values);
	};

	const getProjects = (selectedProjects) => {
		const selectedProjectsIds = map(selectedProjects, '_id');
		return values(omit(props.projects, selectedProjectsIds)).map(({ _id, name }) => {
			return { name, value: _id };
		});
	};

	const renderPermissions = (projects = []) => (
		<FieldArray name="permissions" render={({ remove, push}) => (
			<>
				{projects.map(({ project, modelsPermissions }, index) => (
					<div key={index}>
						<button
							type="button"
							onClick={() => remove(index)}
						>remove</button>
						<Field name={`permissions.${index}.project`} render={({ field }) => (
							<FormControl>
								<InputLabel shrink htmlFor={`project-${index}`}>Project</InputLabel>
								<CellSelect
									{...field}
									items={getProjects(projects)}
									placeholder="Select project"
									displayEmpty
									inputId={`project-${index}`}
								/>
							</FormControl>
						)} />
						<Field name={`permissions.${index}.isAdmin`} render={({ field }) => (
							<FormControlLabel
								control={
									<Checkbox
										checked={field.value}
										{...field}
										color="secondary"
									/>
								}
								label="Project Admin"
							/>
						)} />
						{project && (<Field name={`permissions.${index}.modelsPermissions`} render={() => (
							<PermissionsTable
								context={PermissionsTableContexts.MODELS}
								permissions={modelsPermissions}
								roles={MODEL_ROLES_LIST}
								onPermissionsChange={this.handlePermissionsChange}
								rowStateInterceptor={this.hasDisabledPermissions}
							/>
						)} />)}
					</div>
				))}
				<Button onClick={() => push({ project: '', isAdmin: false, modelsPermissions: [] })}>
					<AddIcon />
					Add project/model permissions
				</Button>
			</>
		)} />
	);

	const renderForm = ({ values }) => (
		<Form>
			<Container className={props.className}>
				<Field name="email" render={({ field }) => (
					<TextField
						label="Email"
						required
						{...field}
					/>
				)} />
				<Field name="job" render={({ field }) => (
					<FormControl>
						<InputLabel shrink htmlFor="job">Job</InputLabel>
						<CellSelect
							{...field}
							items={props.jobs}
							displayEmpty
							placeholder="Unassigned"
							inputId="job"
							itemTemplate={JobItem}
						/>
					</FormControl>
				)} />
				<Field name="isAdmin" render={({ field }) => (
					<FormControlLabel
						control={
							<Checkbox
								checked={field.value}
								{...field}
								color="secondary"
							/>
						}
						label="Teamspace Admin"
					/>
				)} />

				{renderPermissions(values.permissions)}
				<Field render={({ form }) => (
					<Button
						type="submit"
						variant="raised"
						color="secondary"
						disabled={!form.isValid || form.isValidating}
					>
						Invite
					</Button>
				)} />
			</Container>
		</Form>
	);

	return (
		<Formik
			validationSchema={invitationSchema}
			onSubmit={handleSubmit}
			initialValues={{ email: props.email, job: props.job, isAdmin: props.isAdmin, permissions: [] }}
			render={renderForm}
		/>
	);
};
