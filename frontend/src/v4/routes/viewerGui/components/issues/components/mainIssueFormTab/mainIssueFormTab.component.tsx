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
import { FunctionComponent } from 'react';
import { InputLabel } from '@mui/material';
import { Field } from 'formik';

import { ISSUE_PRIORITIES, ISSUE_STATUSES } from '../../../../../../constants/issues';
import { LONG_TEXT_CHAR_LIM } from '../../../../../../constants/viewerGui';
import { canChangeStatus } from '../../../../../../helpers/issues';
import { CellSelect } from '../../../../../components/customTable/components/cellSelect/cellSelect.component';
import { DateField } from '../../../../../components/dateField/dateField.component';
import { TextField } from '../../../../../components/textField/textField.component';
import {
	Container,
	FieldsRow,
	StyledFormControl,
} from '../../../risks/components/riskDetails/riskDetails.styles';
import { UpdateButtons } from '../../../updateButtons/updateButtons.component';
import { Content, DescriptionImage } from '../issueDetails/issueDetails.styles';
import { IssueSchema } from '../issueDetails/issueDetails.schema';
import { DateFieldContainer } from './mainIssueFormTab.styles';

interface IProps {
	active: boolean;
	issue: any;
	permissions: any;
	topicTypes: any;
	currentUser: any;
	myJob: any;
	isNew: boolean;
	canEditBasicProperty: boolean;
	canEditViewpoint: boolean;
	canChangeAssigned: boolean;
	jobs: any[];
	disableViewer?: boolean;
	hasPin: boolean;
	onSavePin: (position) => void;
	onChangePin: (pin) => void;
	onUpdateViewpoint: () => void;
	onTakeScreenshot: () => void;
	onUploadScreenshot: (image) => void;
	showScreenshotDialog: (config: any) => void;
}

export const MainIssueFormTab: FunctionComponent<IProps> = ({
	active, issue, permissions, topicTypes, currentUser, myJob, isNew, canChangeAssigned,
	canEditBasicProperty, canEditViewpoint, jobs, disableViewer, ...props
}) => (
		<Content active={active}>
			<Container>
				<Field name="desc" render={({ field }) => (
					<TextField
						{...field}
						requiredConfirm={!isNew}
						fullWidth
						multiline
						label="Description"
						disabled={!canEditBasicProperty}
						validationSchema={IssueSchema}
						mutable={!isNew}
						enableMarkdown
						inputProps={{ maxLength: LONG_TEXT_CHAR_LIM }}
						placeholder="Type a description"
						disableShowDefaultUnderline
						className="description"
					/>
				)} />
			</Container>

			{issue.descriptionThumbnail && (
				<DescriptionImage
					src={issue.descriptionThumbnail}
					enablePreview
				/>
			)}

			<FieldsRow container alignItems="center" justifyContent="space-between">
				<UpdateButtons
					isNew={isNew}
					disableViewer={disableViewer}
					canEditViewpoint={canEditViewpoint}
					hasNoPermission={!canEditBasicProperty}
					onChangePin={props.onChangePin}
					onSavePin={props.onSavePin}
					onUpdateViewpoint={props.onUpdateViewpoint}
					onTakeScreenshot={props.onTakeScreenshot}
					onUploadScreenshot={props.onUploadScreenshot}
					onShowScreenshotDialog={props.showScreenshotDialog}
					hasImage={issue.descriptionThumbnail}
					hasPin={props.hasPin}
				/>
			</FieldsRow>

			<FieldsRow container alignItems="center" justifyContent="space-between">
				<StyledFormControl>
					<InputLabel shrink htmlFor="priority">Priority</InputLabel>
					<Field name="priority" render={({ field }) => (
						<CellSelect
							{...field}
							items={ISSUE_PRIORITIES}
							inputId="priority"
							disabled={!canEditBasicProperty}
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
							disabled={!(isNew || canChangeStatus(issue, myJob, permissions, currentUser))}
						/>
					)} />
				</StyledFormControl>
			</FieldsRow>
			<FieldsRow container alignItems="center" justifyContent="space-between">
				<StyledFormControl>
					<InputLabel shrink htmlFor="assigned_roles">Assign</InputLabel>
					<Field name="assigned_roles" render={({ field }) => (
						<CellSelect
							{...field}
							items={jobs}
							inputId="assigned_roles"
							disabled={!(isNew || canChangeAssigned)}
						/>
					)} />
				</StyledFormControl>
				<StyledFormControl>
					<InputLabel disabled={!canEditBasicProperty || !topicTypes.length} shrink htmlFor="topic_type">Type</InputLabel>
					<Field name="topic_type" render={({ field }) => (
						<CellSelect
							{...field}
							items={topicTypes}
							inputId="topic_type"
							disabled={!canEditBasicProperty}
						/>
					)} />
				</StyledFormControl>
			</FieldsRow>
			<FieldsRow container justifyContent="space-between" flex={0.5}>
				<StyledFormControl>
					<InputLabel shrink>Due date</InputLabel>
					<Field name="due_date" render={({ field }) => (
						<DateFieldContainer>
							<DateField
								{...field}
								disabled={!canEditBasicProperty}
								placeholder="Choose a due date"
							/>
						</DateFieldContainer>
					)} />
				</StyledFormControl>
			</FieldsRow>
		</Content>
	);
