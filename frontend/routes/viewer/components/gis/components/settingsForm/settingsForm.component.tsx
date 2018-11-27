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
import { isEmpty, isEqual } from 'lodash';
import { Formik, Form, Field } from 'formik';
import FormHelperText from '@material-ui/core/FormHelperText';

import { Header, Headline, StyledTextField } from './settingsForm.styles';

interface IProps {
	updateModelSettings: (modelData, settings) => void;
	getDataFromPathname: () => { teamspace, modelId };
	initialValues: any;
}

interface IState {
	latitude?: number;
	longitude?: number;
	angleFromNorth?: number;
	axisX?: number;
	axisY?: number;
	axisZ?: number;
	submittedValues: any;
}

export class SettingsForm extends React.PureComponent<IProps, IState> {
	public state = {
		latitude: 0,
		longitude: 0,
		axisX: 0,
		axisY: 0,
		axisZ: 0,
		angleFromNorth: 0,
		submittedValues: this.props.initialValues
	};

	public formikRef = React.createRef<any>();

	public componentDidMount = () => {
		const changes = {} as any;

		if (!isEmpty(this.props.initialValues)) {
			const { latitude, longitude, axisX, axisY, axisZ, angleFromNorth } = this.state;
			const {
				latitude: lat, longitude: lng, axisX: x, axisY: y, axisZ: z, angleFromNorth: afn
			} = this.props.initialValues;

			if (!isEqual(latitude, lat)) {
				changes.latitude = lat;
			}

			if (!isEqual(longitude, lng)) {
				changes.longitude = lng;
			}

			if (!isEqual(angleFromNorth, afn)) {
				changes.angleFromNorth = afn;
			}

			if (!isEqual(axisX, x)) {
				changes.axisX = x;
			}

			if (!isEqual(axisY, y)) {
				changes.axisY = y;
			}

			if (!isEqual(axisZ, z)) {
				changes.axisZ = z;
			}
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public handlePointChange = (onChange, name) => (event, ...params) => {
		this.setState({
			[name]: Number(event.target.value)
		});

		onChange(event, ...params);
	}

	public handleSubmit = (values, form) => {
		const { angleFromNorth, axisX, axisY, axisZ, latitude, longitude } = values;

		const settings = {
			angleFromNorth,
			surveyPoints: [{
				position: [ axisX, axisY, axisZ ],
				latLong: [ latitude, longitude ]
			}]
		};

		const { teamspace, modelId } = this.props.getDataFromPathname();
		const project = localStorage.getItem('lastProject');
		const modelData = { teamspace, project, modelId };

		if (isEqual(this.state.submittedValues, values)) {
			form.setError('Points have not been changed');
		} else {
			form.setError('');
			this.props.updateModelSettings(modelData, settings);
			this.setState({ submittedValues: values});
		}
	}

	public render() {
		const { latitude, longitude, axisX, axisY, axisZ, angleFromNorth } = this.state;

		return (
			<Formik
				initialValues={this.props.initialValues}
				onSubmit={this.handleSubmit}
				ref={this.formikRef}>

				{(form) => (
					<Form>
						<Header>
							To visualize map tiles match GIS point with project base point
						</Header>

						<Headline color="primary" variant="subheading">
							GIS Point - World Coordinates
						</Headline>

							<Field name="latitude" render={ ({ field }) => (
								<StyledTextField
									{...field}
									type="number"
									label="Latitude (Decimal)"
									margin="normal"
									value={latitude}
									onChange={this.handlePointChange(field.onChange, field.name)}
								/>
							)} />
							<Field name="longitude" render={ ({ field }) => (
								<StyledTextField
									{...field}
									type="number"
									label="Longitude"
									margin="normal"
									value={longitude}
									onChange={this.handlePointChange(field.onChange, field.name)}
								/>
							)} />
							<Field name="angleFromNorth" render={ ({ field }) => (
								<StyledTextField
									{...field}
									type="number"
									label="Angle from North (Clockwise Degrees)"
									margin="normal"
									value={angleFromNorth}
									onChange={this.handlePointChange(field.onChange, field.name)}
								/>
							)} />
						<Headline color="primary" variant="subheading">
							Project base Point - Model Coordinates
						</Headline>

						<Field name="axisX" render={ ({ field }) => (
							<StyledTextField
								{...field}
								type="number"
								label="x (mm)"
								margin="normal"
								value={axisX}
								onChange={this.handlePointChange(field.onChange, field.name)}
							/>
						)} />
						<Field name="axisY" render={ ({ field }) => (
							<StyledTextField
								{...field}
								type="number"
								label="y (mm)"
								margin="normal"
								value={axisY}
								onChange={this.handlePointChange(field.onChange, field.name)}
							/>
						)} />
						<Field name="axisZ" render={ ({ field }) => (
							<StyledTextField
								{...field}
								type="number"
								label="z (mm)"
								margin="normal"
								value={axisZ}
								onChange={this.handlePointChange(field.onChange, field.name)}
							/>
						)} />
						{form.error && <FormHelperText error={true}>{form.error}</FormHelperText>}
					</Form>
				)}
			</Formik>
		);
	}
}
