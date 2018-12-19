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
import SaveIcon from '@material-ui/icons/Save';
import CameraIcon from '@material-ui/icons/AddAPhoto';
import PinDropIcon from '@material-ui/icons/PinDrop';
import IconButton from '@material-ui/core/IconButton';

import {
	Container, StyledButton, StyledTextField, Actions, ActionsGroup, TextFieldWrapper
} from './newCommentForm.styles';

interface IProps {
	onSave: (commentData) => void;
	onTakeScreenshot: () => void;
	onChangePin: () => void;
	viewpoint: any;
}

export class NewCommentForm extends React.PureComponent<IProps, any> {
	public state = {
		comment: '',
		screenshot: ''
	};

	public handleSave = () => {
		const {comment, screenshot} = this.state;
		const updatedViewpoint = {
			...this.props.viewpoint,
			screenshot
		};

		this.props.onSave({comment, updatedViewpoint});
	}

	public handleTakeScreenshot = () => {
		this.props.onTakeScreenshot();
	}

	public handleChangePin = () => {
		this.props.onChangePin();
	}

	public handleCommentChange = ({ target: { value }}) => {
		this.setState({
			comment: value
		});
	}

	public render() {
		const { comment, screenshot } = this.state;

		return (
			<Container>
				<TextFieldWrapper>
					<StyledTextField
						autoFocus={true}
						placeholder="Write your comment here"
						multiline={true}
						fullWidth={true}
						value={comment}
						onChange={this.handleCommentChange}
						InputLabelProps={{shrink: true }}
						inputProps={{ rowsMax: 4, maxLength: 220 }}
					/>
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
					<StyledButton
						variant="fab"
						color="secondary"
						mini={true}
						disabled={!comment && !screenshot}
						aria-label="Add new comment"
						onClick={this.handleSave}>
						<SaveIcon />
					</StyledButton>
				</Actions>
			</Container>
		);
	}
}
