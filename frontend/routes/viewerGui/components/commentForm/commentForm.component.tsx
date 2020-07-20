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

import InputLabel from '@material-ui/core/InputLabel';
import CameraIcon from '@material-ui/icons/AddAPhoto';
import AddPhoto from '@material-ui/icons/AddPhotoAlternate';
import CloseIcon from '@material-ui/icons/Close';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';
import SaveIcon from '@material-ui/icons/Save';
import ShortTextIcon from '@material-ui/icons/ShortText';
import ReactTextareaAutocomplete from '@webscopeio/react-textarea-autocomplete';
import { Field, Formik } from 'formik';
import { values as _values } from 'lodash';
import React from 'react';
import * as Yup from 'yup';

import { RISK_CONSEQUENCES, RISK_LIKELIHOODS } from '../../../../constants/risks';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { CellSelect } from '../../../components/customTable/components/cellSelect/cellSelect.component';
import { Image } from '../../../components/image';
import { UserAvatar } from '../../../components/messagesList/components/message/components/userAvatar';
import { ScreenshotDialog } from '../../../components/screenshotDialog';
import { TooltipButton } from '../../../teamspaces/components/tooltipButton/tooltipButton.component';
import { FieldsRow, StyledFormControl } from '../risks/components/riskDetails/riskDetails.styles';
import { ViewerPanelButton } from '../viewerPanel/viewerPanel.styles';
import { COMMENT_FIELD_NAME } from './commentForm.constants';
import {
	Actions,
	ActionsGroup,
	Container,
	FileUploadContainer,
	FileUploadInvoker,
	IssueSuggestion,
	RemoveButtonWrapper,
	StyledForm,
	StyledTextField,
	TextFieldWrapper,
	UserSuggestion,
} from './commentForm.styles';

interface IProps {
	formRef: any;
	horizontal: boolean;
	issues: any[];
	canComment: boolean;
	comment?: string;
	screenshot?: string;
	viewpoint?: any;
	hideComment?: boolean;
	hideScreenshot?: boolean;
	hideUploadButton?: boolean;
	showResidualRiskInput?: boolean;
	isModelLoaded: boolean;
	viewer: any;
	onSave: (commentData, finishSubmitting) => void;
	onTakeScreenshot: (screenshot) => void;
	showScreenshotDialog: (options) => void;
	setDisabled: (isDisabled) => void;
	deactivateMeasure: () => void;
	setIsPinDropMode: (mode: boolean) => void;
	teamspaceUsers: any[];
	disableIssuesSuggestions?: boolean;
	fetchingDetailsIsPending?: boolean;
	postCommentIsPending?: boolean;
}

interface IState {
	isPinActive: boolean;
	newScreenshot: string;
	isResidualRiskInputActive: boolean;
	optionsCaret: string;
}

const CommentSchema = Yup.object().shape({
	comment: Yup.string().max(220)
});

interface ISuggestionItem {
	entity: {
		user: string
	};
}

const UserSuggestionItem = ({ entity: { ...userData } }: ISuggestionItem) => (
	<UserSuggestion user={userData}>
		<UserAvatar name={userData.user} currentUser={userData} />
	</UserSuggestion>
);

const IssueSuggestionItem = ({ entity: { ...issueData } }) => (
	<IssueSuggestion {...issueData} />
);

export class CommentForm extends React.PureComponent<IProps, IState> {
	get commentTypeIcon() {
		return this.state.isResidualRiskInputActive ? ReportProblemIcon : ShortTextIcon;
	}

	get commentTypeLabel() {
		return this.state.isResidualRiskInputActive ? 'Text Comment' : 'Residual Risk';
	}

	get commentPlaceholder() {
		if (this.props.canComment) {
			return 'Write your comment here';
		}
		return 'You are not able to comment';
	}

	private filteredUsersList = (token) => this.props.teamspaceUsers.filter(({ user }) =>
		user.startsWith(token)).slice(0, 5)

	private filteredIssuesList = (token) =>
			_values(this.props.issues).filter(({ number: issueNumber }) =>
			String(issueNumber).startsWith(token)).slice(0, 5)

	public state = {
		isPinActive: false,
		newScreenshot: '',
		isResidualRiskInputActive: this.props.showResidualRiskInput,
		optionsCaret: 'start',
	};

	public fileInputRef = React.createRef<HTMLInputElement>();

	public renderScreenshotButton = renderWhenTrue(() => (
		<TooltipButton
			Icon={CameraIcon}
			label="Take a screenshot"
			action={this.handleNewScreenshot}
			disabled={!this.props.canComment || !this.props.isModelLoaded}
		/>
	));

	public renderUploadImageButton = renderWhenTrue(() => (
		<FileUploadContainer>
			<TooltipButton
				Icon={AddPhoto}
				label="Upload image"
				action={this.handleUploadImageClick}
				disabled={!this.props.canComment}
			/>
			<FileUploadInvoker ref={this.fileInputRef} onChange={this.handleFileUpload} />
		</FileUploadContainer>
	));

	public renderCommentTypeToggle = renderWhenTrue(() => (
		<TooltipButton
			Icon={this.commentTypeIcon}
			color={this.getButtonColor(this.state.isResidualRiskInputActive)}
			label={this.commentTypeLabel}
			action={this.handleChangeCommentType}
			disabled={!this.props.canComment}
		/>
	));

	private renderTextAreaComponent = React.forwardRef((props, ref) => {
		return (
			<>
				<StyledTextField
					{...props}
					autoFocus
					placeholder={this.commentPlaceholder}
					multiline
					fullWidth
					InputLabelProps={{ shrink: true }}
					inputProps={{ rowsMax: 4, maxLength: 220 }}
					disabled={!this.props.canComment}
					inputRef={ref}
				/>
			</>
		);
	});

	private outputUser = (item, trigger) => ({ text: `${trigger}${item.user}`, caretPosition: 'end' });

	private outputIssue = (item, trigger) => ({ text: `${trigger}${item.number}`, caretPosition: 'end' });

	private get autocompleteTriggers() {
		const usersTrigger = {
			'@': {
				dataProvider: (token) => this.filteredUsersList(token),
				component: UserSuggestionItem,
				output: this.outputUser,
			},
		};

		if (!this.props.disableIssuesSuggestions) {
			return ({
				...usersTrigger,
				'#': {
					dataProvider: (token) => this.filteredIssuesList(token),
					component: IssueSuggestionItem,
					output: this.outputIssue,
				},
			});
		}

		return usersTrigger;
	}

	public renderCommentField = renderWhenTrue(() => (
		<TextFieldWrapper>
			<Field name={COMMENT_FIELD_NAME} render={({ field }) => (
				<ReactTextareaAutocomplete
					{...field}
					textAreaComponent={this.renderTextAreaComponent}
					loadingComponent={() => null}
					renderToBody
					minChar={0}
					trigger={this.autocompleteTriggers}
				/>
			)} />
		</TextFieldWrapper>
	));

	public removeImage = (e) => {
		e.stopPropagation();
		this.resetFileInput();
		this.props.onTakeScreenshot('');
	}

	public handleImageClick = () => {
		this.props.showScreenshotDialog({
			sourceImage: this.state.newScreenshot,
			onSave: (screenshot) => {
				this.props.onTakeScreenshot(screenshot);
				this.resetFileInput();
			},
			template: ScreenshotDialog,
			notFullScreen: true,
		});
	}

	public renderCreatedScreenshot = renderWhenTrue(() => {
		return (
			<>
				<RemoveButtonWrapper screenshot>
					<TooltipButton
						label="Remove"
						action={this.removeImage}
						Icon={CloseIcon}
					/>
				</RemoveButtonWrapper>
				<Image src={this.state.newScreenshot} onClick={this.handleImageClick} className="new-comment" />
			</>
		);
	});

	public renderResidualRiskFields = renderWhenTrue(() => (
		<Container>
			<FieldsRow container alignItems="center" justify="space-between">
				<StyledFormControl>
					<InputLabel shrink htmlFor="likelihood">Risk Likelihood</InputLabel>
					<Field name="likelihood" render={({ field }) => (
						<CellSelect
							{...field}
							items={RISK_LIKELIHOODS}
							inputId="likelihood"
							disabled={!this.props.canComment}
						/>
					)} />
				</StyledFormControl>

				<StyledFormControl>
					<InputLabel shrink htmlFor="consequence">Risk Consequence</InputLabel>
					<Field name="consequence" render={({ field }) => (
						<CellSelect
							{...field}
							items={RISK_CONSEQUENCES}
							inputId="consequence"
							disabled={!this.props.canComment}
						/>
					)} />
				</StyledFormControl>
			</FieldsRow>

			<Field name="mitigation_desc" render={({ field }) => (
				<StyledTextField
					{...field}
					multiline
					fullWidth
					InputLabelProps={{ shrink: true }}
					label="Residual Risk"
					placeholder="Describe the residual risk"
					disabled={!this.props.canComment}
				/>
			)} />
		</Container>
	));

	public componentDidUpdate = (prevProps) => {
		if (prevProps.screenshot !== this.props.screenshot) {
			this.setState({
				newScreenshot: this.props.screenshot
			});
			this.props.formRef.current.setFieldValue('screenshot', this.props.screenshot);
		}
	}

	public componentWillUnmount() {
		this.props.viewer.setPinDropMode(false);
		this.props.setDisabled(false);
	}

	public handleSave = (values, form) => {
		const screenshot = values.screenshot.substring(values.screenshot.indexOf(',') + 1);
		const commentValues = { ...values, screenshot };
		this.props.onSave(commentValues, () => {
			form.resetForm();
		});
		this.setState({ newScreenshot: ''});
		form.resetForm();
	}

	public resetFileInput = () => {
		if (this.fileInputRef.current) {
			this.fileInputRef.current.value = '';
		}
	}

	public handleNewScreenshot = () => {
		const { showScreenshotDialog, onTakeScreenshot, viewer } = this.props;

		showScreenshotDialog({
			sourceImage: viewer.getScreenshot(),
			onSave: (screenshot) => onTakeScreenshot(screenshot),
			template: ScreenshotDialog,
			notFullScreen: true,
		});
	}

	public handleFileUpload = (event) => {
		const file = event.target.files[0];
		const reader = new FileReader();
		const { onTakeScreenshot, showScreenshotDialog } = this.props;

		reader.addEventListener('load', () => {
			showScreenshotDialog({
				sourceImage: reader.result,
				onSave: (screenshot) => {
					onTakeScreenshot(screenshot);
					this.resetFileInput();
				},
				onCancel: () => this.resetFileInput(),
				template: ScreenshotDialog,
				notFullScreen: true,
			});
		}, false);

		reader.readAsDataURL(file);
	}

	public handleUploadImageClick = () => {
		if (this.fileInputRef.current && document.createEvent) {
			const evt = document.createEvent('MouseEvents');
			evt.initEvent('click', true, false);
			this.fileInputRef.current.dispatchEvent(evt);
		}
	}

	public handleChangeCommentType = () => {
		const isResidualRiskInputActive = !this.state.isResidualRiskInputActive;

		this.setState({ isResidualRiskInputActive });
	}

	public render() {
		const {
			hideComment,
			hideScreenshot,
			hideUploadButton,
			showResidualRiskInput,
			formRef,
			canComment,
			postCommentIsPending,
			fetchingDetailsIsPending,
		} = this.props;
		const isPending = postCommentIsPending || fetchingDetailsIsPending;

		return (
			<Container>
				{this.renderCreatedScreenshot(Boolean(this.state.newScreenshot))}
				<Formik
					ref={formRef}
					initialValues={{ comment: '', screenshot: this.state.newScreenshot }}
					validationSchema={CommentSchema}
					onSubmit={this.handleSave}
				>
					<StyledForm>
						{this.renderResidualRiskFields(showResidualRiskInput && this.state.isResidualRiskInputActive)}
						{this.renderCommentField(!hideComment && (!showResidualRiskInput || !this.state.isResidualRiskInputActive))}
						<Actions>
							<ActionsGroup>
								{this.renderScreenshotButton(!hideScreenshot)}
								{this.renderUploadImageButton(!hideUploadButton)}
								{this.renderCommentTypeToggle(!hideComment && showResidualRiskInput)}
							</ActionsGroup>
							<Field render={({ form }) => (
									<ViewerPanelButton
										variant="fab"
										color="secondary"
										type="submit"
										mini
										disabled={!hideComment && (!canComment || !form.isValid || form.isValidating) || form.isSubmitting}
										aria-label="Add new comment"
										pending={isPending}
									>
										<SaveIcon fontSize="small" />
									</ViewerPanelButton>
								)}
							/>
						</Actions>
					</StyledForm>
				</Formik>
			</Container>
		);
	}

	private getButtonColor(buttonState) {
		let color;

		if (this.props.canComment) {
			color = buttonState ? 'secondary' : 'action';
		}

		return color;
	}
}
