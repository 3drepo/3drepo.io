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

import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import AddIcon from '@mui/icons-material/AddCircleOutline';
import RemoveIcon from '@mui/icons-material/RemoveCircleOutline';
import { Field, FieldArray, Form, Formik } from 'formik';
import { keyBy, map, omit, pick, uniqBy, values } from 'lodash';
import { isEmpty } from 'lodash';
import { useEffect, useRef } from 'react';
import * as yup from 'yup';

import { TeamspacesActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { MODEL_ROLES_LIST, MODEL_ROLES_TYPES } from '../../../constants/model-permissions';
import { schema } from '../../../services/validation';
import { CellSelect } from '../customTable/components/cellSelect/cellSelect.component';
import { JobItem } from '../jobItem/jobItem.component';
import { PermissionsTableContexts } from '../permissionsTable/permissionsTable.component';
import { SubmitButton } from '../submitButton/submitButton.component';
import {
	AddButton,
	CancelButton,
	Container,
	Content,
	Footer,
	IconButton,
	PermissionsTable,
	ProjectCheckboxContainer,
	ProjectConfig,
	TextField
} from './invitationDialog.styles';

const invitationSchema = yup.object().shape({
	email: schema.email,
	job: schema.required,
});

interface IProps {
	teamspace: string;
	className?: string;
	email?: string;
	job?: string;
	isAdmin?: boolean;
	jobs: any[];
	permissions?: any[];
	projects: any;
	models: any;
	permissionsOnUIDisabled: boolean;
	handleClose: () => void;
	sendInvitation: (email, job, isAdmin, permissions, onFinish, onError) => void;
}

export const InvitationDialog = (props: IProps) => {
	const formRef = useRef(null);
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const { used } = TeamspacesHooksSelectors.selectCurrentQuotaSeats();

	useEffect(() => {
		const { isValid, validateForm } = formRef.current;

		if (!isValid && props.email) {
			validateForm();
		}
	}, []);

	const handleSubmit = (formValues, actions) => {
		const onFinish = () => {
			actions.setSubmitting(false);
			props.handleClose();

			TeamspacesActionsDispatchers.setUsedQuotaSeats(teamspace, used + 1);
		};

		const onError = () => {
			actions.setSubmitting(false);
		};
		props.sendInvitation(formValues.email, formValues.job, formValues.isAdmin, formValues.permissions, onFinish, onError);
	};

	const getProjects = (currentProject, selectedProjects) => {
		const selectedProjectsIds = map(selectedProjects, 'project');
		const availableProjects = values(omit(props.projects, selectedProjectsIds));

		if (currentProject) {
			availableProjects.push(props.projects[currentProject]);
		}
		return availableProjects.map(({ _id, name }) => {
			return { name, value: _id };
		});
	};

	const getModelsPermissions = (currentProject, currentModelsPermissions) => {
		const project = props.projects[currentProject];
		const modelsPermissionsMap = keyBy(currentModelsPermissions, 'model');
		return values(pick(props.models, project.models)).map(({ name, model, federate }) => ({
			model,
			name,
			isFederation: federate,
			key: MODEL_ROLES_TYPES.UNASSIGNED,
			...(modelsPermissionsMap[model] || {})
		}));
	};

	const handlePermissionsChange = (name, currentPermissions, onChange) => (newPermissions) => {
		const value = uniqBy([...newPermissions, ...currentPermissions], 'model');
		onChange({ target: { value, name }});
	};

	const handleProjectAdminChange = (field, form, index) => (event) => {
		field.onChange(event);
		form.values.permissions[index].models = [];
	};

	const renderPermissions = (projects = []) => (
		<FieldArray name="permissions" render={({ remove, push }) => (
			<>
				{projects.map(({ project, isAdmin }, index) => (
					<div key={index}>
						<ProjectConfig>
							<Field name={`permissions.${index}.project`} render={({ field }) => (
								<FormControl>
									<InputLabel shrink htmlFor={`project-${index}`}>Project</InputLabel>
									<CellSelect
										{...field}
										items={getProjects(project, projects)}
										placeholder="Select project"
										disabledPlaceholder
										displayEmpty
										inputId={`project-${index}`}
									/>
								</FormControl>
							)} />
							<IconButton onClick={() => remove(index)} size="large">
								<RemoveIcon />
							</IconButton>
							{project && (
								<Field name={`permissions.${index}.isAdmin`} render={({ field, form }) => (
									<ProjectCheckboxContainer
										control={
											<Checkbox
												checked={field.value}
												{...field}
												onChange={handleProjectAdminChange(field, form, index)}
												color="secondary"
											/>
										}
										label="Project Admin"
									/>
								)} />
							)}
						</ProjectConfig>
						{project && !isAdmin && (
							<Field name={`permissions.${index}.models`} render={({ field }) => (
								<PermissionsTable
									modelsNumber={props.projects[project].models.length + 1}
									context={PermissionsTableContexts.MODELS}
									permissions={getModelsPermissions(project, field.value)}
									roles={MODEL_ROLES_LIST}
									onPermissionsChange={handlePermissionsChange(field.name, field.value, field.onChange)}
								/>
							)} />
						)}
					</div>
				))}
				{values(props.projects).length !== projects.length && (
					<AddButton
						color="secondary"
						onClick={() => push({ project: '', isAdmin: false, models: [] })}>
						<AddIcon color="secondary" />
						Add project/model permissions
					</AddButton>
				)}
			</>
		)} />
	);

	const renderForm = ({ values: formValues }) => (
		<Form>
			<Container className={props.className}>
				<Content>
					<Field name="email" render={({ field, form }) => (
						<TextField
								label="Email"
								required
								error={form.errors.email}
								helperText={form.errors.email}
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
					{!props.permissionsOnUIDisabled && (
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
					)}

					{!formValues.isAdmin && !props.permissionsOnUIDisabled && renderPermissions(formValues.permissions)}
				</Content>
				<Footer>
					<CancelButton
						type="button"
						color="primary"
						variant="text"
						onClick={props.handleClose}
					>
						Cancel
					</CancelButton>
					<Field render={({ form }) => (
						<SubmitButton
							pending={form.isSubmitting}
							disabled={!isEmpty(form.errors) || !form.isValid || form.isValidating || form.isSubmitting}
						>
							Invite
						</SubmitButton>
				)} />
				</Footer>
			</Container>
		</Form>
	);

	const getIsInitialValid = () => {
		try {
			invitationSchema.validateSync({ email: props.email, job: props.job });
			return true;
		} catch (e) {
			return false;
		}
	}

	return (
		<Formik
			validationSchema={invitationSchema}
			onSubmit={handleSubmit}
			isInitialValid={getIsInitialValid()}
			initialValues={{ email: props.email, job: props.job, isAdmin: props.isAdmin, permissions: props.permissions }}
			render={renderForm}
			innerRef={formRef}
		/>
	);
};
