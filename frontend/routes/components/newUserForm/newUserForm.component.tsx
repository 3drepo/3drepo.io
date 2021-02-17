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

import { debounce } from 'lodash';
import React, { ReactNodeArray } from 'react';
import Autosuggest from 'react-autosuggest';

import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';

import { JobItem } from '../jobItem/jobItem.component';
import { UserItem } from '../userItem/userItem.component';

import { renderWhenTrue } from '../../../helpers/rendering';
import {
	Container,
	EmptySelectValue,
	InvitationModeLink,
	SaveButton,
	StyledSelect,
	StyledTextField,
	SuggestionsList,
	Title,
	UserNotExistsButton,
	UserNotExistsContainer
} from './newUserForm.styles';

interface IProps {
	title: string | ReactNodeArray;
	jobs: any[];
	users: any[];
	onInvitationOpen: (email, job, isAdmin) => void;
	onSave: (user) => void;
	onCancel: () => void;
	clearSuggestions: () => void;
	getUsersSuggestions: (searchText) => void;
}

interface IState {
	name: string;
	job: string;
	isAdmin: boolean;
	userNotExists: boolean;
}

export class NewUserForm extends React.PureComponent<IProps, IState> {
	public state = {
		name: '',
		job: '',
		isAdmin: false,
		userNotExists: false
	};

	private popperNode = null;

	public handleChange = (field) => (event) => {
		this.setState({[field]: event.target.value || '', userNotExists: false} as any);
	}

	public handlePermissionsChange = (event, isAdmin) => {
		this.setState({isAdmin});
	}

	public handleSave = () => {
		this.props.onSave({...this.state});
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

	public setUserNotExists = (userNotExists) => {
		this.setState({ userNotExists });
	}

	public renderInputComponent = (inputProps) => {
		const {inputRef , ref, ...other} = inputProps;

		return (
			<StyledTextField
				fullWidth
				InputProps={ {
					inputRef: (node) => {
						ref(node);
						inputRef(node);
					}
				} }
				{...other}
			/>
		);
	}

	public getSuggestionValue = (suggestion) => {
		return suggestion.user;
	}

	public onSuggestionSelected = (event, {suggestion}) => {
		this.setState({name: this.getSuggestionValue(suggestion)});
	}

	private debounceUsersSuggestion = debounce(this.props.getUsersSuggestions, 1000);

	public onSuggestionsFetchRequested = ({value}) => {
		this.debounceUsersSuggestion(value);
	}

	public openInvitationDialog = () => {
		this.props.onInvitationOpen(this.state.name, this.state.job, this.state.isAdmin);
	}

	public renderUserSuggestion = (suggestion, {query, isHighlighted}) => {
		return (
			<MenuItem selected={isHighlighted} component="div">
				<UserItem {...suggestion} searchText={query} />
			</MenuItem>
		);
	}

	public renderSuggestionsContainer = (options) => (
		<SuggestionsList
			anchorEl={this.popperNode}
			open={Boolean(options.children)}
			placement="bottom"
		>
			<Paper
				square
				{...options.containerProps}
				style={{ width: this.popperNode ? this.popperNode.clientWidth : null }}
			>
				{options.children}
			</Paper>
		</SuggestionsList>
	)

	public renderUserNotFoundMessage = renderWhenTrue(() => (
		<UserNotExistsContainer>
			User not found.
			<UserNotExistsButton onClick={this.openInvitationDialog}>Send invitation?</UserNotExistsButton>
		</UserNotExistsContainer>
	));

	public render() {
		const { clearSuggestions, jobs, users, title } = this.props;
		return (
			<Container>
				<Grid
					container
					direction="column">
					<Title>{title}</Title>

					<FormControl required>
						<Autosuggest
							suggestions={users}
							onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
							onSuggestionsClearRequested={clearSuggestions}
							onSuggestionSelected={this.onSuggestionSelected}
							getSuggestionValue={this.getSuggestionValue}
							renderInputComponent={this.renderInputComponent}
							renderSuggestion={this.renderUserSuggestion}
							inputProps={ {
								onChange: this.handleChange('name'),
								label: 'Username or email address',
								value: this.state.name,
								inputRef: (node) => {
									this.popperNode = node;
								}
							} }
							renderSuggestionsContainer={this.renderSuggestionsContainer}
						/>
					</FormControl>

					<FormControl>
						<InputLabel shrink htmlFor="job">Job</InputLabel>
						<StyledSelect
							value={this.state.job}
							displayEmpty
							inputProps={ {
								id: 'job'
							} }
							onChange={this.handleChange('job')}
						>
							<EmptySelectValue value="">Unassigned</EmptySelectValue>
							{this.renderJobs(jobs)}
						</StyledSelect>
					</FormControl>

					<FormControlLabel
						control={
							<Checkbox
								color="secondary"
								checked={this.state.isAdmin}
								onChange={this.handlePermissionsChange}
							/>
						}
						label="Add as Teamspace Admin"
					/>
					{this.renderUserNotFoundMessage(this.state.userNotExists)}
					<Grid
						container
						direction="row">
						<SaveButton
							variant="contained"
							color="secondary"
							disabled={this.state.userNotExists || !this.state.name || !this.state.job || this.state.job.length === 0}
							aria-label="Save"
							onClick={this.handleSave}>
							+ Add user
						</SaveButton>
					</Grid>
					<InvitationModeLink onClick={this.openInvitationDialog}>
						Invite to 3D Repo...
					</InvitationModeLink>
				</Grid>
			</Container>
		);
	}
}
