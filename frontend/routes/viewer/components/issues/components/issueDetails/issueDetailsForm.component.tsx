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

import * as React from 'react';
import * as Yup from 'yup';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import DayJsUtils from '@date-io/dayjs';
import { get, isEqual, isEmpty, debounce } from 'lodash';
import { Field, Form, withFormik, connect } from 'formik';

import InputLabel from '@material-ui/core/InputLabel';
import { Image } from '../../../../../components/image';
import {
	FieldsRow, StyledFormControl
}	from './../../../risks/components/riskDetails/riskDetails.styles';
import {
	ISSUE_STATUSES, ISSUE_PRIORITIES, ISSUE_TOPIC_TYPES, DEFAULT_PROPORTIES
} from '../../../../../../constants/issues';
import { CellSelect } from '../../../../../components/customTable/components/cellSelect/cellSelect.component';
import { DateField } from '../../../../../components/dateField/dateField.component';
import { VALIDATIONS_MESSAGES } from '../../../../../../services/validation';
import { canChangeBasicProperty, canChangeStatus, canChangeAssigned } from '../../../../../../helpers/issues';
import { TextField } from '../../../../../components/textField/textField.component';
import { DescriptionImage } from './issueDetails.styles';

interface IProps {
	issue: any;
	jobs: any[];
	formik: any;
	values: any;
	permissions: any;
	currentUser: any;
	myJob: any;
	onSubmit: (values) => void;
	onValueChange: (event) => void;
	handleChange: (event) => void;
	handleSubmit: () => void;
}

interface IState {
	isSaving: boolean;
}

const IssueSchema = Yup.object().shape({
	description: Yup.string().max(220, VALIDATIONS_MESSAGES.TOO_LONG_STRING)
});

class IssueDetailsFormComponent extends React.PureComponent<IProps, IState> {
	public state = {
		isSaving: false
	};

	get isNewIssue() {
		return !this.props.issue._id;
	}

	public componentDidUpdate(prevProps) {
		const changes = {} as IState;
		const { values, formik } = this.props;
		const valuesChanged = !isEqual(prevProps.values, values);

		if (formik.dirty) {
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

	public autoSave = debounce(() => {
		const { formik, handleSubmit } = this.props;
		if (!formik.isValid) {
			return;
		}

		this.setState({ isSaving: true }, () => {
			formik.setFieldValue();
			handleSubmit();
			this.setState({ isSaving: false });
		});
	}, 200);

	public getDueDateFormat = (timestamp) => {
		const formatBase = 'DD MMM';
		const dueDateYear = new Date(timestamp).getFullYear();
		const thisYear = new Date().getFullYear();
		const format = thisYear === dueDateYear ? formatBase : formatBase + ' YYYY';
		return format;
	}

	public render() {
		const { issue, myJob, permissions, currentUser } = this.props;

		return (
			<MuiPickersUtilsProvider utils={DayJsUtils}>
				<Form>
					<FieldsRow container alignItems="center" justify="space-between">
						<StyledFormControl>
							<InputLabel shrink={true} htmlFor="priority">Priority</InputLabel>
							<Field name="priority" render={({ field }) => (
								<CellSelect
									{...field}
									items={ISSUE_PRIORITIES}
									inputId="priority"
									disabled={!canChangeBasicProperty(issue, myJob, permissions, currentUser)}
								/>
							)} />
						</StyledFormControl>
						<StyledFormControl>
							<InputLabel shrink={true} htmlFor="status">Status</InputLabel>
							<Field name="status" render={({ field }) => (
								<CellSelect
									{...field}
									items={ISSUE_STATUSES}
									inputId="status"
									disabled={!canChangeStatus(issue, myJob, permissions, currentUser)}
								/>
							)} />
						</StyledFormControl>
					</FieldsRow>
					<FieldsRow container alignItems="center" justify="space-between">
						<StyledFormControl>
							<InputLabel shrink={true} htmlFor="assigned_roles">Assign</InputLabel>
							<Field name="assigned_roles" render={({ field }) => (
								<CellSelect
									{...field}
									items={this.props.jobs}
									inputId="assigned_roles"
									disabled={!canChangeAssigned(issue, myJob, permissions, currentUser)}
								/>
							)} />
						</StyledFormControl>
						<StyledFormControl>
							<InputLabel shrink={true} htmlFor="topic_type">Type</InputLabel>
							<Field name="topic_type" render={({ field }) => (
								<CellSelect
									{...field}
									items={ISSUE_TOPIC_TYPES}
									inputId="topic_type"
									disabled={!canChangeBasicProperty(issue, myJob, permissions, currentUser)}
								/>
							)} />
						</StyledFormControl>
					</FieldsRow>
					<FieldsRow container justify="space-between" flex={0.5}>
						<StyledFormControl>
							<InputLabel shrink={true}>Due date</InputLabel>
							<Field name="due_date" render={({ field }) =>
								<DateField
									{...field}
									format={this.getDueDateFormat(field.value)}
									disabled={!canChangeBasicProperty(issue, myJob, permissions, currentUser)}
									placeholder="Choose a due date" />}
								/>
						</StyledFormControl>
						<StyledFormControl>
							Pin stuff
						</StyledFormControl>
					</FieldsRow>
					<Field name="description" render={({ field }) => (
						<TextField
							{...field}
							requiredConfirm={!this.isNewIssue}
							fullWidth
							multiline
							label="Description"
							disabled={!canChangeBasicProperty(issue, myJob, permissions, currentUser)}
							validationSchema={IssueSchema}
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
			</MuiPickersUtilsProvider>
		);
	}
}

export const IssueDetailsForm = withFormik({
	mapPropsToValues: ({ issue }) => {
		return ({
			status: issue.status || DEFAULT_PROPORTIES.STATUS,
			priority: issue.priority || DEFAULT_PROPORTIES.PRIORITY,
			topic_type: issue.topic_type || DEFAULT_PROPORTIES.TOPIC_TYPE,
			assigned_roles: get(issue, 'assigned_roles[0]', ''),
			due_date: issue.due_date,
			description: issue.description
		});
	},
	handleSubmit: (values, { props }) => {
		(props as IProps).onSubmit(values);
	},
	enableReinitialize: true,
	validationSchema: IssueSchema
})(connect(IssueDetailsFormComponent as any)) as any;
