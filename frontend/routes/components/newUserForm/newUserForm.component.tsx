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

import { ButtonProps } from '@material-ui/core/Button';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';

import { JobItem } from '../jobItem/jobItem.component';
import {
	Container, Title, SaveButton, StyledTextField, StyledSelect
} from './newUserForm.styles';

interface IProps {
	jobs: any[];
	onSave: () => void;
	onCancel: () => void;
}

interface IState {
	name: string;
	job: string;
}

export class NewUserForm extends React.PureComponent<IProps, IState> {
	public state = {
		name: '',
		job: ''
	};

	public handleChange = (field) => (event) => {
		this.setState({[field]: event.target.value || ''});
	}

	public renderJobs = (jobs) => {
		return jobs.map((jobProps, index) => {
			return (
				<MenuItem key={index} value={jobProps.name}>
					<JobItem {...jobProps} />
				</MenuItem>
			);
		});
	}

	public render() {
		const { onSave, onCancel, jobs } = this.props;

		return (
			<Container>

				<Grid
					container
					direction="column">
					<Title>Add new member</Title>
					<StyledTextField
						placeholder="Username or email address"
						onChange={this.handleChange('name')}
					/>

					<FormControl>
						<InputLabel htmlFor="job">Job</InputLabel>
						<StyledSelect
							value={this.state.job}
							onChange={this.handleChange('job')}
							inputProps={{
								id: 'job'
							}}
						>
							{this.renderJobs(jobs)}
						</StyledSelect>
					</FormControl>

					<Grid
						container
						direction="row">
						<SaveButton
							variant="contained"
							color="secondary"
							disabled={!this.state.name}
							aria-label="Save"
							onClick={onSave}>
							+ Add user
						</SaveButton>
					</Grid>
				</Grid>
			</Container>
		);
	}
}
