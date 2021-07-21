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

import { Button } from '@material-ui/core';
import { Form } from 'formik';
import React from 'react';

import {
	DeleteButton,
	FieldsRow,
	FormContainer,
	Headline,
	StyledButtonContainer,
	StyledCopyableTextField
} from '../profile.styles';

interface IProps {
	apiKey: string;
	onGenerateApiKey: () => void;
	onDeleteApiKey: () => void;
}

export class APIKeyForm extends React.PureComponent<IProps> {
	public render() {
		const apiKey =  this.props.apiKey || '';
		return (
			<Form>
				<FormContainer container direction="column">
					<Headline color="primary" variant="subtitle1">Api Key</Headline>
					<FieldsRow container wrap="nowrap">
						<StyledCopyableTextField
							value={apiKey}
							inputProps={{
								readOnly: true
							}}
							margin="normal"
						/>
					</FieldsRow>
					<StyledButtonContainer>
						<Button
							color="secondary"
							variant="contained"
							disabled={false}
							type="button"
							onClick={this.onClickGenerate}
						>
							Generate
						</Button>
						<DeleteButton
							variant="contained"
							disabled={!apiKey}
							type="button"
							onClick={this.onClickDelete}
						>
							Delete
						</DeleteButton>
					</StyledButtonContainer>
				</FormContainer>
			</Form>
		);
	}

	private onClickGenerate = (e: React.SyntheticEvent) => {
		e.stopPropagation();
		this.props.onGenerateApiKey();
	}

	private onClickDelete = (e: React.SyntheticEvent) => {
		e.stopPropagation();
		this.props.onDeleteApiKey();
	}
}
