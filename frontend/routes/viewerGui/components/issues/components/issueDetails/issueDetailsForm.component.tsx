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

import DayJsUtils from '@date-io/dayjs';
import { withFormik, Field, Form } from 'formik';
import { debounce, get, isEmpty, isEqual } from 'lodash';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import React from 'react';
import * as Yup from 'yup';

import InputLabel from '@material-ui/core/InputLabel';
import { ISSUE_PRIORITIES, ISSUE_STATUSES } from '../../../../../../constants/issues';
import { canChangeAssigned, canChangeBasicProperty, canChangeStatus } from '../../../../../../helpers/issues';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { VALIDATIONS_MESSAGES } from '../../../../../../services/validation';
import { CellSelect } from '../../../../../components/customTable/components/cellSelect/cellSelect.component';
import { DateField } from '../../../../../components/dateField/dateField.component';
import { Image } from '../../../../../components/image';
import { Resources } from '../../../../../components/resources/resources.component';
import { TextField } from '../../../../../components/textField/textField.component';
import PinButton from '../../../pinButton/pinButton.container';
import {
	FieldsRow, StyledFormControl
}	from './../../../risks/components/riskDetails/riskDetails.styles';
import { DescriptionImage } from './issueDetails.styles';

interface IProps {
	issue: any;
	jobs: any[];
	formik: any;
	values: any;
	permissions: any;
	topicTypes: any;
	currentUser: any;
	myJob: any;
	isValid: boolean;
	dirty: boolean;
	onSubmit: (values) => void;
	onValueChange: (event) => void;
	handleChange: (event) => void;
	handleSubmit: () => void;
	onSavePin: (position) => void;
	onChangePin: (pin) => void;
	onRemoveResource: (resource) => void;
	attachFileResources: () => void;
	attachLinkResources: () => void;
	showDialog: (config: any) => void;
	hidePin?: boolean;
	hasPin: boolean;
	canComment: boolean;
}

interface IState {
	isSaving: boolean;
}

const IssueSchema = Yup.object().shape({
	description: Yup.string().max(220, VALIDATIONS_MESSAGES.TOO_LONG_STRING)
});

class IssueDetailsFormComponent extends React.PureComponent<IProps, IState> {
	get isNewIssue() {
		return !this.props.issue._id;
	}

	get canEditBasicProperty() {
		const { issue, myJob, permissions, currentUser } = this.props;
		return this.isNewIssue || canChangeBasicProperty(issue, myJob, permissions, currentUser);
	}

	public state = {
		isSaving: false
	};

	public autoSave = debounce(() => {
		const { onSubmit, isValid, values } = this.props;

		if (!isValid) {
			return;
		}

		this.setState({ isSaving: true }, () => {
			onSubmit(values);
			this.setState({ isSaving: false });
		});
	}, 200);

	public renderPinButton = renderWhenTrue(() => (
		<StyledFormControl>
			<PinButton
				onChange={this.props.onChangePin}
				onSave={this.props.onSavePin}
				hasPin={this.props.hasPin}
				disabled={!this.isNewIssue && !this.canEditBasicProperty}
			/>
		</StyledFormControl>
	));

	public componentDidUpdate(prevProps) {
		const changes = {} as IState;
		const { values, dirty } = this.props;
		const valuesChanged = !isEqual(prevProps.values, values);
		if (dirty) {
			if (valuesChanged && !this.state.isSaving) {
				this.autoSave();
			}

			if (valuesChanged && this.state.isSaving) {
				changes.isSaving = false;
			}
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public getDueDateFormat = (timestamp) => {
		const formatBase = 'DD MMM';
		const dueDateYear = new Date(timestamp).getFullYear();
		const thisYear = new Date().getFullYear();
		const format = thisYear === dueDateYear ? formatBase : formatBase + ' YYYY';
		return format;
	}

	public render() {
		const { issue, myJob, permissions,
				topicTypes, currentUser, onRemoveResource,
				attachFileResources, attachLinkResources, showDialog,
				canComment } = this.props;

		return (
			<MuiPickersUtilsProvider utils={DayJsUtils}>
				<Form>
					<FieldsRow container alignItems="center" justify="space-between">
						<StyledFormControl>
							<InputLabel shrink htmlFor="priority">Priority</InputLabel>
							<Field name="priority" render={({ field }) => (
								<CellSelect
									{...field}
									items={ISSUE_PRIORITIES}
									inputId="priority"
									disabled={!this.canEditBasicProperty}
								/>
							)} />
						</StyledFormControl>
						<StyledFormControl>
							<InputLabel shrink htmlFor="status">Status</InputLabel>
							<Field name="status" render={({ field }) => (
								<CellSelect
									{...field}
									items={ISSUE_STATUSES}
									inputId="status"
									disabled={!(this.isNewIssue || canChangeStatus(issue, myJob, permissions, currentUser))}
								/>
							)} />
						</StyledFormControl>
					</FieldsRow>
					<FieldsRow container alignItems="center" justify="space-between">
						<StyledFormControl>
							<InputLabel shrink htmlFor="assigned_roles">Assign</InputLabel>
							<Field name="assigned_roles" render={({ field }) => (
								<CellSelect
									{...field}
									items={this.props.jobs}
									inputId="assigned_roles"
									disabled={!(this.isNewIssue || canChangeAssigned(issue, myJob, permissions, currentUser))}
								/>
							)} />
						</StyledFormControl>
						<StyledFormControl>
							<InputLabel shrink htmlFor="topic_type">Type</InputLabel>
							<Field name="topic_type" render={({ field }) => (
								<CellSelect
									{...field}
									items={topicTypes}
									labelName="label"
									inputId="topic_type"
									disabled={!this.canEditBasicProperty}
								/>
							)} />
						</StyledFormControl>
					</FieldsRow>
					<FieldsRow container justify="space-between" flex={0.5}>
						<StyledFormControl>
							<InputLabel shrink>Due date</InputLabel>
							<Field name="due_date" render={({ field }) =>
								<DateField
									{...field}
									format={this.getDueDateFormat(field.value)}
									disabled={!this.canEditBasicProperty}
									placeholder="Choose a due date" />}
								/>
						</StyledFormControl>
						{this.renderPinButton(!this.props.hidePin)}
					</FieldsRow>
					<Field name="desc" render={({ field }) => (
						<TextField
							{...field}
							requiredConfirm={!this.isNewIssue}
							fullWidth
							multiline
							label="Description"
							disabled={!this.canEditBasicProperty}
							validationSchema={IssueSchema}
							mutable={!this.isNewIssue}
						/>
					)} />

					{this.props.issue.descriptionThumbnail && (
						<DescriptionImage>
							<Image
								src={this.props.issue.descriptionThumbnail}
								enablePreview
							/>
						</DescriptionImage>
					)}
				</Form>
				{!this.isNewIssue &&
					<Resources showDialog={showDialog}
						resources={issue.resources}
						onSaveFiles={attachFileResources}
						onSaveLinks={attachLinkResources}
						onRemoveResource={onRemoveResource}
						canEdit={canComment}
					/>
				}
			</MuiPickersUtilsProvider>
		);
	}
}

export const IssueDetailsForm = withFormik({
	mapPropsToValues: ({ issue }) => {
		return ({
			status: issue.status,
			priority: issue.priority,
			topic_type: issue.topic_type,
			assigned_roles: get(issue, 'assigned_roles[0]', ''),
			due_date: issue.due_date,
			desc: issue.desc
		});
	},
	handleSubmit: (values, { props }) => {
		(props as IProps).onSubmit(values);
	},
	enableReinitialize: true,
	validationSchema: IssueSchema
})(IssueDetailsFormComponent as any) as any;
