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
import * as Yup from 'yup';
import { Formik, Field, Form } from 'formik';
import SaveIcon from '@material-ui/icons/Save';
import CameraIcon from '@material-ui/icons/AddAPhoto';
import PinDropIcon from '@material-ui/icons/PinDrop';

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
import { ViewerPanelButton } from '../viewerPanel/viewerPanel.styles';
import { VIEWER_EVENTS } from '../../../../constants/viewer';

interface IProps {
	innerRef: any;
	comment?: string;
	screenshot?: string;
	viewpoint?: any;
	hideComment?: boolean;
	hidePin?: boolean;
	hideScreenshot?: boolean;
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
		isPinActive: false
	};

	get pinColor() {
		return this.state.isPinActive ? 'secondary' : 'action';
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
		/>
	));

	public renderPinButton = renderWhenTrue(() => (
		<TooltipButton
			Icon={PinDropIcon}
			color={this.pinColor}
			label="Add a pin"
			action={this.handleChangePin}
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
				/>
			)} />
		</TextFieldWrapper>
	));

	public render() {
		const { hideComment, hideScreenshot, hidePin, innerRef, comment, screenshot } = this.props;
		return (
			<Container>
				<Formik
					ref={innerRef}
					initialValues={{ comment, screenshot }}
					validationSchema={NewCommentSchema}
					onSubmit={this.handleSave}
				>
					<StyledForm>
						{this.renderCommentField(!hideComment)}
						<Actions>
							<ActionsGroup>
								{this.renderScreenshotButton(!hideScreenshot)}
								{this.renderPinButton(!hidePin)}
							</ActionsGroup>
							<Field render={({ form }) =>
								<ViewerPanelButton
									variant="fab"
									color="secondary"
									type="submit"
									mini={true}
									disabled={!hideComment && (!form.isValid || form.isValidating)}
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
