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

import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import { ColorPicker } from '../colorPicker/colorPicker.component';
import {
	Container,
	Title,
	SaveButton,
	StyledTextField,
	StyledTextFieldContainer
} from './newJobForm.styles';

interface IProps {
	title: string;
	colors: string[];
	onSave: (job) => void;
	onCancel: () => void;
}

interface IState {
	name: string;
	color?: string;
}

export class NewJobForm extends React.PureComponent<IProps, IState> {
	public state = {
		name: '',
		color: ''
	};

	public handleChange = (field) => (value) => {
		this.setState({[field]: value});
	}

	public handleSave = () => {
		this.props.onSave({...this.state});
	}

	public render() {
		const {title, colors} = this.props;
		const {name, color} = this.state;

		return (
			<Container>
				<Grid
					container
					direction="column">
					<Title>{title}</Title>

					<Grid
						item
						container
						direction="row"
						spacing={16}
						wrap="nowrap"
					>
						<StyledTextFieldContainer item>
							<StyledTextField
								autoFocus
								placeholder="Set job name"
								fullWidth
								value={name}
								onChange={(event) => this.handleChange('name')(event.currentTarget.value)}
								InputLabelProps={{
									shrink: true
								}}
							/>
						</StyledTextFieldContainer>
						<Grid item>
							<ColorPicker
								value={color}
								predefinedColors={colors}
								onChange={this.handleChange('color')}
							/>
						</Grid>
					</Grid>
					<SaveButton
						variant="contained"
						color="secondary"
						disabled={!name}
						aria-label="Add new job"
						onClick={this.handleSave}>
						+ Add job
					</SaveButton>
				</Grid>
			</Container>
		);
	}
}
