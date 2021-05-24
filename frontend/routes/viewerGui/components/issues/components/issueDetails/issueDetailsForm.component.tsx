/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import React from 'react';

import Tabs from '@material-ui/core/Tabs';
import Tooltip from '@material-ui/core/Tooltip';
import { withFormik, Form } from 'formik';
import { debounce, get, isEmpty, isEqual } from 'lodash';
import * as Yup from 'yup';

import {
	ATTACHMENTS_ISSUE_TAB,
	ISSUE_PROPERTIES_TAB,
	ISSUE_SEQUENCING_TAB,
	ISSUE_TABS,
} from '../../../../../../constants/issues';
import { LONG_TEXT_CHAR_LIM, VIEWER_PANELS_TITLES } from '../../../../../../constants/viewerGui';
import { canChangeAssigned, canChangeBasicProperty, canComment } from '../../../../../../helpers/issues';
import { VALIDATIONS_MESSAGES } from '../../../../../../services/validation';
import { AttachmentsFormTab } from '../../../risks/components/attachmentsFormTab/attachmentsFormTab.component';
import { SequencingFormTab } from '../../../risks/components/sequencingFormTab/sequencingFormTab.component';
import { MainIssueFormTab } from '../mainIssueFormTab/mainIssueFormTab.component';
import { StyledTab, TabContent } from './issueDetails.styles';

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
	onThumbnailUpdate: () => void;
	showScreenshotDialog: (config: any) => void;
	showDialog: (config: any) => void;
	disableViewer?: boolean;
	hasPin: boolean;
	canComment: boolean;
	formRef: any;
	onUpdateViewpoint: () => void;
	onTakeScreenshot: () => void;
	onUploadScreenshot: (image) => void;
	showSequenceDate: (date) => void;
	minSequenceDate: number;
	maxSequenceDate: number;
	selectedDate: Date;
	sequences: any[];
}

interface IState {
	isSaving: boolean;
	activeTab: string;
}

export const IssueSchema = Yup.object().shape({
	desc: Yup.string().max(LONG_TEXT_CHAR_LIM, VALIDATIONS_MESSAGES.TOO_LONG_STRING)
});

class IssueDetailsFormComponent extends React.PureComponent<IProps, IState> {
	get isNewIssue() {
		return !this.props.issue._id;
	}

	get canEditBasicProperty() {
		const { issue, myJob, permissions, currentUser } = this.props;
		return this.isNewIssue || canChangeBasicProperty(issue, myJob, permissions, currentUser);
	}

	get canEditViewpoint() {
		const { issue, myJob, permissions, currentUser } = this.props;
		return this.isNewIssue || canComment(issue, myJob, permissions, currentUser);
	}

	get canChangeAssigned() {
		const { issue, myJob, permissions, currentUser } = this.props;
		return canChangeAssigned(issue, myJob, permissions, currentUser);
	}

	public state = {
		isSaving: false,
		activeTab: ISSUE_PROPERTIES_TAB,
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

	private handleChange = (event, activeTab) => {
		this.setState({ activeTab });
	}

	public showIssueContent = (active) => (
		<MainIssueFormTab
			active={active}
			isNew={this.isNewIssue}
			canEditBasicProperty={this.canEditBasicProperty}
			canEditViewpoint={this.canEditViewpoint}
			canChangeAssigned={this.canChangeAssigned}
			{...this.props}
		/>
	)

	public showSequencingContent = (active) => (
		<SequencingFormTab
			active={active}
			isNewTicket={this.isNewIssue}
			{...this.props}
			showSequenceDate={this.props.showSequenceDate}
			min={this.props.minSequenceDate}
			max={this.props.maxSequenceDate}
			startTimeValue={this.props.values.sequence_start}
			endTimeValue={this.props.values.sequence_end}
			sequences={this.props.sequences}
		/>
	)

	public showAttachmentsContent = (active) => (
		<AttachmentsFormTab active={active} resources={this.props.issue.resources} {...this.props} />
	)

	get attachmentsProps() {
		if (!this.isNewIssue) {
			return {
				label: ISSUE_TABS.ATTACHMENTS
			};
		}

		return {
			disabled: true,
			label: (
				<Tooltip title={`Save the ${VIEWER_PANELS_TITLES.issues} before adding an attachment`}>
					<span>{ISSUE_TABS.ATTACHMENTS}</span>
				</Tooltip>
			)
		};
	}

	public render() {
		const { activeTab } = this.state;

		return (
			<Form>
				<Tabs
					value={activeTab}
					indicatorColor="secondary"
					textColor="primary"
					onChange={this.handleChange}
				>
					<StyledTab label={ISSUE_TABS.ISSUE} value={ISSUE_PROPERTIES_TAB} />
					<StyledTab label={ISSUE_TABS.SEQUENCING} value={ISSUE_SEQUENCING_TAB} />
					<StyledTab {...this.attachmentsProps} value={ATTACHMENTS_ISSUE_TAB} />
				</Tabs>
				<TabContent>
					{this.showIssueContent(activeTab === ISSUE_PROPERTIES_TAB)}
					{this.showSequencingContent(activeTab === ISSUE_SEQUENCING_TAB)}
					{this.showAttachmentsContent(activeTab === ATTACHMENTS_ISSUE_TAB)}
				</TabContent>
			</Form>
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
			desc: issue.desc,
			sequence_start: issue.sequence_start,
			sequence_end: issue.sequence_end
		});
	},
	handleSubmit: (values, { props }) => {
		(props as IProps).onSubmit(values);
	},
	enableReinitialize: true,
	validationSchema: IssueSchema
})(IssueDetailsFormComponent as any) as any;
