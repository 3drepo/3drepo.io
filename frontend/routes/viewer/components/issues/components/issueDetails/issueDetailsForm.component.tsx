import * as React from 'react';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import LuxonUtils from '@date-io/luxon';

import { get } from 'lodash';
import { Field, Form, withFormik } from 'formik';
import InputLabel from '@material-ui/core/InputLabel';
import { Image } from '../../../../../components/image';
import {
	FieldsRow, StyledFormControl, StyledTextField
}	from './../../../risks/components/riskDetails/riskDetails.styles';
import {
	ISSUE_STATUSES, ISSUE_PRIORITIES, ISSUE_TOPIC_TYPES
} from '../../../../../../constants/issues';
import { CellSelect } from '../../../../../components/customTable/components/cellSelect/cellSelect.component';
import { DateField } from '../../../../../components/dateField/dateField.component';
interface IProps {
	issue: any;
	jobs: any[];
}
class IssueDetailsFormComponent extends React.PureComponent<IProps, any> {
	public render() {
		return (
			<MuiPickersUtilsProvider utils={LuxonUtils}>
				<Form>
					<FieldsRow container alignItems="center" justify="space-between">
						<StyledFormControl>
							<InputLabel shrink={true} htmlFor="priority">Priority</InputLabel>
							<Field name="priority" render={({ field }) => (
								<CellSelect
									{...field}
									items={ISSUE_PRIORITIES}
									inputId="priority"
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
								/>
							)} />
						</StyledFormControl>
					</FieldsRow>

					<FieldsRow container justify="space-between" isHalf={true}>
						<StyledFormControl>
							<InputLabel shrink={true} htmlFor="due_date">Due date</InputLabel>
							<Field name="due_date" render={({ field }) => (
								<DateField
									{...field}
									inputId="due_date"
								/>
							)} />
						</StyledFormControl>
					</FieldsRow>
					<Field name="description" render={({ field }) => (
						<StyledTextField
							{...field}
							fullWidth
							multiline
							label="Description"
						/>
					)} />
					{this.props.issue.descriptionThumbnail && <Image
						src={this.props.issue.descriptionThumbnail}
						enablePreview
					/>}
				</Form>
			</MuiPickersUtilsProvider>
		);
	}
}

export const IssueDetailsForm = withFormik({
	mapPropsToValues: ({ issue }) => {
		return ({
			status: issue.status || '',
			priority: issue.priority || '',
			topic_type: issue.topic_type || '',
			assigned_roles: get(issue, 'assigned_roles[0]', ''),
			due_date: issue.due_date,
			description: issue.description
		});
	},
	handleSubmit: () => {},
	enableReinitialize: true
})(IssueDetailsFormComponent as any) as any;
