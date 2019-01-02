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
import IconButton from '@material-ui/core/IconButton';

import {
	StyledButton, StyledTextField, Actions, ActionsGroup, TextFieldWrapper
} from './newCommentForm.styles';

interface IProps {
	onSave: (commentData) => void;
	onTakeScreenshot: () => void;
	onChangePin: () => void;
	viewpoint: any;
}

const NewCommentSchema = Yup.object().shape({
	newComment: Yup.string().max(220)
});

export class NewCommentForm extends React.PureComponent<IProps, any> {
	public state = {
		screenshot: ''
	};

	public handleSave = ({newComment}, {resetForm}) => {
		const {screenshot} = this.state;
		const updatedViewpoint = {
			...this.props.viewpoint,
			screenshot
		};

		this.props.onSave({comment: newComment, updatedViewpoint});
		resetForm();
		this.setState({screenshot: ''});
	}

	public handleTakeScreenshot = () => {
		this.props.onTakeScreenshot();
	}

	public handleChangePin = () => {
		this.props.onChangePin();
	}

	public render() {
		return (
			<Formik
				initialValues={{ newComment: '', screenshot: '' }}
				validationSchema={NewCommentSchema}
				onSubmit={this.handleSave}
				>
				<Form>
					<TextFieldWrapper>
						<Field name="newComment" render={ ({ field, form }) => (
							<StyledTextField
								{...field}
								autoFocus={true}
								placeholder="Write your comment here"
								multiline={true}
								fullWidth={true}
								InputLabelProps={{shrink: true }}
								inputProps={{ rowsMax: 4, maxLength: 220 }}
							/>
						)} />
					</TextFieldWrapper>
					<Actions>
						<ActionsGroup>
							<IconButton component="span" aria-label="Take a screenshot" onClick={this.handleTakeScreenshot}>
								<CameraIcon />
							</IconButton>
							<IconButton component="span" aria-label="Change a pin" onClick={this.handleChangePin}>
								<PinDropIcon />
							</IconButton>
						</ActionsGroup>
						<Field render={ ({ form }) =>
							<StyledButton
								variant="fab"
								color="secondary"
								type="submit"
								mini={true}
								disabled={((!form.isValid || form.isValidating) && !this.state.screenshot)}
								aria-label="Add new comment"
							>
								<SaveIcon />
							</StyledButton>} />
					</Actions>
				</Form>
			</Formik>
		);
	}
}
