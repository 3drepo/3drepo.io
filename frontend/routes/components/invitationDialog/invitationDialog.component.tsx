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
import React, { useMemo, useState } from 'react';
import { JobItem } from '../jobItem/jobItem.component';
import { Container, EmptySelectValue, StyledSelect, TextField } from './invitationDialog.styles';

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

	return (
		<Formik
			onSubmit={handleSubmit}
			initialValues={{ email: props.email, job: props.job, isAdmin: props.isAdmin }}
		>
			<Form>
				<Container className={props.className}>
					<Field name="email" render={({ field }) => (
						<TextField
							label="Email"
							{...field}
						/>
					)} />
					<Field name="job" render={({ field }) => (
						<FormControl>
							<InputLabel shrink htmlFor="job">Job</InputLabel>
							<StyledSelect
								{...field}
								displayEmpty
								inputProps={{
									id: 'job'
								}}
							>
								<EmptySelectValue value="">Unassigned</EmptySelectValue>
								{jobs}
							</StyledSelect>
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
		</Formik>
	);
};
