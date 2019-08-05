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

import InputLabel from '@material-ui/core/InputLabel';
import CameraIcon from '@material-ui/icons/AddAPhoto';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';
import SaveIcon from '@material-ui/icons/Save';
import ShortTextIcon from '@material-ui/icons/ShortText';
import { Field, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import {
	RISK_CONSEQUENCES,
	RISK_LIKELIHOODS
} from '../../../../constants/risks';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { CellSelect } from '../../../components/customTable/components/cellSelect/cellSelect.component';
import { Image } from '../../../components/image';
import { TooltipButton } from '../../../teamspaces/components/tooltipButton/tooltipButton.component';
import { FieldsRow, StyledFormControl } from '../risks/components/riskDetails/riskDetails.styles';
import { ViewerPanelButton } from '../viewerPanel/viewerPanel.styles';
import {
	Actions,
	ActionsGroup,
	Container,
	StyledForm,
	StyledTextField,
	TextFieldWrapper
} from './newCommentForm.styles';

interface IProps {
	formRef: any;
	canComment: boolean;
	comment?: string;
	screenshot?: string;
	viewpoint?: any;
	hideComment?: boolean;
	hideScreenshot?: boolean;
	showResidualRiskInput?: boolean;
	viewer: any;
	onSave: (commentData, finishSubmitting) => void;
	onTakeScreenshot: (screenshot) => void;
	showScreenshotDialog: (options) => void;
	setDisabled: (isDisabled) => void;
	deactivateMeasure: () => void;
	setIsPinDropMode: (mode: boolean) => void;
}

interface IState {
	isPinActive: boolean;
	newScreenshot: string;
	isResidualRiskInputActive: boolean;
}

const NewCommentSchema = Yup.object().shape({
	comment: Yup.string().max(220)
});

export class NewCommentForm extends React.PureComponent<IProps, IState> {
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

	public state = {
		isPinActive: false,
		newScreenshot: '',
		isResidualRiskInputActive: this.props.showResidualRiskInput
	};

	public renderScreenshotButton = renderWhenTrue(() => (
		<TooltipButton
			Icon={CameraIcon}
			label="Take a screenshot"
			action={this.handleNewScreenshot}
			disabled={!this.props.canComment}
		/>
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

	public renderCommentField = renderWhenTrue(() => (
		<TextFieldWrapper>
			<Field name="comment" render={({ field }) => (
				<StyledTextField
					{...field}
					autoFocus
					placeholder={this.commentPlaceholder}
					multiline
					fullWidth
					InputLabelProps={{ shrink: true }}
					inputProps={{ rowsMax: 4, maxLength: 220 }}
					disabled={!this.props.canComment}
				/>
			)} />
		</TextFieldWrapper>
	));

	public renderCreatedScreenshot = renderWhenTrue(() =>
		<Image src={this.state.newScreenshot} className="new-comment" />
	);

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

	public handleNewScreenshot = () => {
		const { showScreenshotDialog, onTakeScreenshot, viewer } = this.props;

		showScreenshotDialog({
			sourceImage: viewer.getScreenshot(),
			onSave: (screenshot) => onTakeScreenshot(screenshot)
		});
	}

	public handleChangeCommentType = () => {
		const isResidualRiskInputActive = !this.state.isResidualRiskInputActive;

		this.setState({ isResidualRiskInputActive });
	}

	public render() {
		const {
			hideComment,
			hideScreenshot,
			showResidualRiskInput,
			formRef,
			canComment
		} = this.props;

		return (
			<Container>
				{this.renderCreatedScreenshot(Boolean(this.state.newScreenshot))}
				<Formik
					ref={formRef}
					initialValues={{ comment: '', screenshot: this.state.newScreenshot }}
					validationSchema={NewCommentSchema}
					onSubmit={this.handleSave}
				>
					<StyledForm>
						{this.renderResidualRiskFields(showResidualRiskInput && this.state.isResidualRiskInputActive)}
						{this.renderCommentField(!hideComment && (!showResidualRiskInput || !this.state.isResidualRiskInputActive))}
						<Actions>
							<ActionsGroup>
								{this.renderScreenshotButton(!hideScreenshot)}
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
