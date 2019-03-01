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
import { Formik, Field, Form } from 'formik';
import SaveIcon from '@material-ui/icons/Save';
import CameraIcon from '@material-ui/icons/AddAPhoto';
import InputLabel from '@material-ui/core/InputLabel';
import PinDropIcon from '@material-ui/icons/PinDrop';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';
import ShortTextIcon from '@material-ui/icons/ShortText';

import { Viewer } from '../../../../services/viewer/viewer';
import { Measure } from '../../../../services/viewer/measure';
import { TooltipButton } from '../../../teamspaces/components/tooltipButton/tooltipButton.component';
import { renderWhenTrue } from '../../../../helpers/rendering';
import {
	StyledTextField,
	Actions,
	ActionsGroup,
	TextFieldWrapper,
	StyledForm,
	Container
} from './newCommentForm.styles';
import {
	LEVELS_OF_RISK,
	RISK_CATEGORIES,
	RISK_CONSEQUENCES,
	RISK_LIKELIHOODS,
	RISK_MITIGATION_STATUSES
} from '../../../../constants/risks';
import { CellSelect } from '../../../components/customTable/components/cellSelect/cellSelect.component';
import { TextField } from '../../../components/textField/textField.component';
import { FieldsRow, StyledFormControl } from '../risks/components/riskDetails/riskDetails.styles';
import { RiskSchema } from '../risks/components/riskDetails/riskDetailsForm.component';
import { ViewerPanelButton } from '../viewerPanel/viewerPanel.styles';
import { VIEWER_EVENTS } from '../../../../constants/viewer';

interface IProps {
	innerRef: any;
	canComment: boolean;
	comment?: string;
	screenshot?: string;
	viewpoint?: any;
	hideComment?: boolean;
	hidePin?: boolean;
	hideScreenshot?: boolean;
	showResidualRiskInput?: boolean;
	onSave: (commentData) => void;
	onTakeScreenshot: (screenshot) => void;
	onChangePin: (pin) => void;
	showScreenshotDialog: (options) => void;
}

const NewCommentSchema = Yup.object().shape({
	text: Yup.string().max(220)
});

const NEW_PIN_ID = 'newPinId';

export class NewCommentForm extends React.PureComponent<IProps, any> {
	public state = {
		isPinActive: false,
		isResidualRiskInputActive: this.props.showResidualRiskInput
	};

	get commentTypeIcon() {
		return this.state.isResidualRiskInputActive ? ReportProblemIcon : ShortTextIcon;
	}

	get commentTypeLabel() {
		return this.state.isResidualRiskInputActive ? "Text Comment" : "Residual Risk";
	}

	private buttonColor(buttonState) {
		let color;

		if (this.props.canComment) {
			color = buttonState ? 'secondary' : 'action';
		}

		return color;
	}

	public componentWillUnmount() {
		Viewer.setPinDropMode(false);
		Measure.setDisabled(false);
		this.togglePinListeners(false);
	}

	public handleSave = ({ comment }, { resetForm }) => {
		const viewpoint = {
			...this.props.viewpoint,
			screenshot: this.props.screenshot
		};

		this.props.onSave({ comment, viewpoint });
		resetForm();
	}

	public handleNewScreenshot = async () => {
		const { showScreenshotDialog, onTakeScreenshot } = this.props;

		showScreenshotDialog({
			sourceImage: Viewer.getScreenshot(),
			onSave: (screenshot) => onTakeScreenshot(screenshot)
		});
	}

	public handleChangeCommentType = () => {
		const isResidualRiskInputActive = !this.state.isResidualRiskInputActive;

		this.setState({ isResidualRiskInputActive });
	}

	public handleChangePin = () => {
		const isPinActive = !this.state.isPinActive;

		if (isPinActive) {
			Viewer.setPinDropMode(true);
			Measure.deactivateMeasure();
			Measure.setDisabled(true);
			this.togglePinListeners(true);
		} else {
			Viewer.setPinDropMode(false);
			Measure.setDisabled(false);
			this.togglePinListeners(false);
		}

		this.setState({ isPinActive });
	}

	public togglePinListeners = (enabled: boolean) => {
		const resolver = enabled ? 'on' : 'off';

		Viewer[resolver](VIEWER_EVENTS.PICK_POINT, this.handlePickPoint);
	}

	public handlePickPoint = ({ trans, position, normal, selectColour, id }) => {
		if (id) {
			return null;
		}

		if (trans) {
			position = trans.inverse().multMatrixPnt(position);
		}

		if (this.props.onChangePin) {
			this.props.onChangePin({
				id: NEW_PIN_ID,
				pickedNorm: normal,
				pickedPos: position,
				selectedObjectId: id,
				selectColor: selectColour
			});
		}
	}

	public renderScreenshotButton = renderWhenTrue(() => (
		<TooltipButton
			Icon={CameraIcon}
			label="Take a screenshot"
			action={this.handleNewScreenshot}
			disabled={!this.props.canComment}
		/>
	));

	public renderPinButton = renderWhenTrue(() => (
		<TooltipButton
			Icon={PinDropIcon}
			color={this.buttonColor(this.state.isPinActive)}
			label="Add a pin"
			action={this.handleChangePin}
			disabled={!this.props.canComment}
		/>
	));

	public renderCommentTypeToggle = renderWhenTrue(() => (
		<TooltipButton
			Icon={this.commentTypeIcon}
			color={this.buttonColor(this.state.isResidualRiskInputActive)}
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
					autoFocus={true}
					placeholder="Write your comment here"
					multiline={true}
					fullWidth={true}
					InputLabelProps={{ shrink: true }}
					inputProps={{ rowsMax: 4, maxLength: 220 }}
					disabled={!this.props.canComment}
				/>
			)} />
		</TextFieldWrapper>
	));

	public renderResidualRiskFields = renderWhenTrue(() => (
		<Container>
			<FieldsRow container alignItems="center" justify="space-between">
				<StyledFormControl>
					<InputLabel shrink={true} htmlFor="likelihood">Risk Likelihood</InputLabel>
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
					<InputLabel shrink={true} htmlFor="consequence">Risk Consequence</InputLabel>
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

			<Field name="mitigation_desc" render={({ field, form }) => (
				<TextField
					{...field}
					requiredConfirm={!this.isNewRisk}
					validationSchema={RiskSchema}
					fullWidth
					multiline
					label="Mitigation"
					disabled={!this.props.canComment}
				/>
			)} />
		</Container>
	));

	public render() {
		const { hideComment, hideScreenshot, hidePin, showResidualRiskInput, innerRef, canComment, comment, screenshot } = this.props;
		return (
			<Container>
				<Formik
					ref={innerRef}
					initialValues={{ comment, screenshot }}
					validationSchema={NewCommentSchema}
					onSubmit={this.handleSave}
				>
					<StyledForm>
						{this.renderResidualRiskFields(showResidualRiskInput && this.state.isResidualRiskInputActive)}
						{this.renderCommentField(!hideComment && (!showResidualRiskInput || !this.state.isResidualRiskInputActive))}
						<Actions>
							<ActionsGroup>
								{this.renderScreenshotButton(!hideScreenshot)}
								{this.renderPinButton(!hidePin)}
								{this.renderCommentTypeToggle(!hideComment && showResidualRiskInput)}
							</ActionsGroup>
							<Field render={({ form }) =>
								<ViewerPanelButton
									variant="fab"
									color="secondary"
									type="submit"
									mini={true}
									disabled={!hideComment && !canComment && (!form.isValid || form.isValidating)}
									aria-label="Add new comment"
								>
									<SaveIcon />
								</ViewerPanelButton>} />
						</Actions>
					</StyledForm>
				</Formik>
			</Container>
		);
	}
}
