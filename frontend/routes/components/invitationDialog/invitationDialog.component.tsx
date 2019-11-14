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
import MenuItem from '@material-ui/core/MenuItem';
import { Field, Form, Formik } from 'formik';
import React, { useMemo } from 'react';
import * as yup from 'yup';
import { MODEL_ROLES_LIST } from '../../../constants/model-permissions';
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
}

export const InvitationDialog = (props: IProps) => {
	const handleSubmit = (values) => {
		console.log('Submit', values);
	};

	const jobs = useMemo(() => {
		return props.jobs.map((jobProps, index) => {
			return (
				<MenuItem key={index} value={jobProps.name}>
					<JobItem {...jobProps} />
				</MenuItem>
			);
		});
	}, [props.jobs]);

	const renderForm = () => (
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

				<Field name="permissions" render={() => (
					<PermissionsTable
						context={PermissionsTableContexts.MODELS}
						permissions={[]}
						roles={MODEL_ROLES_LIST}
						onPermissionsChange={this.handlePermissionsChange}
						rowStateInterceptor={this.hasDisabledPermissions}
					/>
				)} />
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
			initialValues={{ email: props.email, job: props.job, isAdmin: props.isAdmin }}
			render={renderForm}
		/>
	);
};
