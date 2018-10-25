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
import { Formik, Form, Field } from 'formik';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';

import { clientConfigService } from '../../services/clientConfig';

import { Panel } from '../components/panel/panel.component';
import { CellSelect } from '../components/customTable/components/cellSelect/cellSelect.component';

import {
	FieldsRow,
	StyledTextField,
	SelectWrapper,
	StyledChip,
	TopicTypesContainer,
	StyledForm,
	Headline,
	TypesGrid,
	GridColumn
} from './modelSettings.styles';

import { COLOR } from '../../styles';

const PANEL_PROPS = {
	title: 'Model Settings',
	paperProps: {
		height: '100%'
	}
};

interface IState {
	types: any[];
}

interface IProps {
	noop: string; // TODO: Remove sample
}

export class ModelSettings extends React.PureComponent<IProps, IState> {
	public state = {
		types: ['hello', 'tydas', 'im typo']
	};

	public componentDidUpdate(prevProps, prevState, snapshot) {
		console.log(prevProps, prevState, snapshot);
	}

	public addTopicType = () => {};

	public deleteTopicType = (name) => {
		this.setState({
			types: this.state.types.filter((typeName) => typeName !== name)
		});
	}

	public handleNewTopicSubmit = (event) => {
		if (event.key === 'Enter') {

			this.setState({
				types: [...this.state.types, event.target.value]
			});

			event.target.value = '';
			event.preventDefault();
		}
	}

	public render() {
		return (
			<Panel {...PANEL_PROPS}>
				<Formik>
					<StyledForm>
						<Headline color="primary" variant="subheading">Model Information</Headline>
						<Grid>
							<FieldsRow container wrap="nowrap">
								<Field name="id" render={({ field, form }) => (
									<StyledTextField
										{...field}
										required
										label="Model ID"
										margin="normal"
										disabled
									/>
								)} />
								<Field name="name" render={({ field, form }) => (
									<StyledTextField
										{...field}
										error={Boolean(form.errors.name)}
										helperText={form.errors.name}
										required
										label="Model name"
										margin="normal"
									/>
								)} />
							</FieldsRow>
							<FieldsRow container wrap="nowrap">
								<Field name="type" render={({ field, form }) => (
									<StyledTextField
										{...field}
										required
										label="Model type"
										margin="normal"
										disabled
									/>
								)} />
								<Field name="code" render={({ field, form }) => (
									<StyledTextField
										{...field}
										required
										label="Model code"
										margin="normal"
									/>
								)} />
							</FieldsRow>
							<FieldsRow container wrap="nowrap">
								<Field name="sequenceTag" render={({ field, form }) => (
									<StyledTextField
										{...field}
										required
										label="4D Sequence Tag"
										margin="normal"
									/>
								)} />
								<SelectWrapper fullWidth={true} required={true}>
									<InputLabel shrink htmlFor="unit-select">Unit</InputLabel>
									<Field name="unit" render={({ field, form }) => (
										<CellSelect
											{...field}
											items={clientConfigService.units}
											inputId="unit-select"
										/>
									)} />
								</SelectWrapper>
							</FieldsRow>
							<TypesGrid container direction="column">
								<TopicTypesContainer>
									{this.state.types.map(
										(type, index) => (
											<StyledChip key={index} label={type} onDelete={() => this.deleteTopicType(type)} />
										)
									)}
								</TopicTypesContainer>
								<Input
									onKeyPress={(event) => this.handleNewTopicSubmit(event)}
									placeholder="Enter topic types"
								/>
							</TypesGrid>
						</Grid>
						<Headline color="primary" variant="subheading">GIS Reference Information</Headline>
						<Grid container direction="column" wrap="nowrap">
							<Grid container direction="row" wrap="nowrap">
								<GridColumn container direction="column" wrap="nowrap">
									<Headline color="textPrimary" variant="subheading">Survey Point</Headline>
									<Field name="latitude" render={({ field, form }) => (
										<StyledTextField
											{...field}
											type="number"
											label="Latitude (Decimal)"
											margin="normal"
										/>
									)} />
									<Field name="longitude" render={({ field, form }) => (
										<StyledTextField
											{...field}
											type="number"
											label="Longitude"
											margin="normal"
										/>
									)} />
									<Field name="elevation" render={({ field, form }) => (
										<StyledTextField
											{...field}
											type="number"
											label="Elevation"
											margin="normal"
										/>
									)} />
									<Field name="angle" render={({ field, form }) => (
										<StyledTextField
											{...field}
											type="number"
											label="Angle from North (Clockwise Degrees)"
											margin="normal"
										/>
									)} />
								</GridColumn>
								<GridColumn container direction="column" wrap="nowrap">
									<Headline color="textPrimary" variant="subheading">Project Point</Headline>
									<Field name="axisX" render={({ field, form }) => (
										<StyledTextField
											{...field}
											type="number"
											label="x (mm)"
											margin="normal"
										/>
									)} />
									<Field name="axisY" render={({ field, form }) => (
										<StyledTextField
											{...field}
											type="number"
											label="y (mm)"
											margin="normal"
										/>
									)} />
									<Field name="axisZ" render={({ field, form }) => (
										<StyledTextField
											{...field}
											type="number"
											label="z (mm)"
											margin="normal"
										/>
									)} />
								</GridColumn>
							</Grid>
						</Grid>
						<Grid container direction="column" alignItems="flex-end">
							<Field render={({ form }) => (
								<Button
									type="submit"
									variant="raised"
									color="secondary"
									disabled={!form.isValid || form.isValidating}
								>
									Save
								</Button>
							)} />
						</Grid>
					</StyledForm>
				</Formik>
			</Panel>
		);
	}
}
