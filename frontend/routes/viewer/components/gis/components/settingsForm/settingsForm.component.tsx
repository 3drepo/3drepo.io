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
import { isEmpty, isEqual } from 'lodash';
import { Formik, Form, Field } from 'formik';
import { VALIDATIONS_MESSAGES } from '../../../../../../services/validation';

import { Header, Headline, StyledTextField } from './settingsForm.styles';

interface IProps {
	updateModelSettings: (modelData, settings) => void;
	getDataFromPathname: () => { teamspace, modelId };
	initialValues: any;
}

interface IState {
	latitude?: number|string;
	longitude?: number|string;
	angleFromNorth?: number|string;
	axisX?: number|string;
	axisY?: number|string;
	axisZ?: number|string;
}

const validateRequiredNumber =
	Yup.number()
	.required(VALIDATIONS_MESSAGES.REQUIRED);

const SettingsSchema = Yup.object().shape({
	latitude: validateRequiredNumber,
	longitude: validateRequiredNumber,
	axisX: validateRequiredNumber,
	axisY: validateRequiredNumber,
	axisZ: validateRequiredNumber,
	angleFromNorth: validateRequiredNumber
});

const defaultFieldProps = {
	type: 'number',
	required: true,
	margin: 'normal'
};
export class SettingsForm extends React.PureComponent<IProps, IState> {
	public state = {
		latitude: '',
		longitude: '',
		axisX: '',
		axisY: '',
		axisZ: '',
		angleFromNorth: ''
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

	public handleSubmit = (values) => {
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

		this.props.updateModelSettings(modelData, settings);
	}

	public render() {
		const { latitude, longitude, axisX, axisY, axisZ, angleFromNorth } = this.state;

		return (
			<Formik
				initialValues={this.props.initialValues}
				onSubmit={this.handleSubmit}
				validationSchema={SettingsSchema}
				ref={this.formikRef}>
				<Form>
					<Header>
						To visualize map tiles match GIS point with project base point
					</Header>
					<Headline color="primary" variant="subheading">
						GIS Point - World Coordinates
					</Headline>
					<Field name="latitude" render={ ({ field, form }) => (
						<StyledTextField
							{...field}
							{...defaultFieldProps}
							error={Boolean(form.errors.latitude)}
							helperText={form.errors.latitude}
							label="Latitude (Decimal)"
							value={latitude}
							onChange={this.handlePointChange(field.onChange, field.name)}
						/>
					)} />
					<Field name="longitude" render={ ({ field, form }) => (
						<StyledTextField
							{...field}
							{...defaultFieldProps}
							error={Boolean(form.errors.longitude)}
							helperText={form.errors.longitude}
							label="Longitude"
							value={longitude}
							onChange={this.handlePointChange(field.onChange, field.name)}
						/>
					)} />
					<Field name="angleFromNorth" render={ ({ field, form }) => (
						<StyledTextField
							{...field}
							{...defaultFieldProps}
							error={Boolean(form.errors.angleFromNorth)}
							helperText={form.errors.angleFromNorth}
							label="Angle from North (Clockwise Degrees)"
							value={angleFromNorth}
							onChange={this.handlePointChange(field.onChange, field.name)}
						/>
					)} />
					<Headline color="primary" variant="subheading">
						Project base Point - Model Coordinates
					</Headline>

					<Field name="axisX" render={ ({ field, form }) => (
						<StyledTextField
							{...field}
							{...defaultFieldProps}
							error={Boolean(form.errors.axisX)}
							helperText={form.errors.axisX}
							label="x (mm)"
							value={axisX}
							onChange={this.handlePointChange(field.onChange, field.name)}
						/>
					)} />
					<Field name="axisY" render={ ({ field, form }) => (
						<StyledTextField
							{...field}
							{...defaultFieldProps}
							error={Boolean(form.errors.axisY)}
							helperText={form.errors.axisY}
							label="y (mm)"
							value={axisY}
							onChange={this.handlePointChange(field.onChange, field.name)}
						/>
					)} />
					<Field name="axisZ" render={ ({ field, form }) => (
						<StyledTextField
							{...field}
							{...defaultFieldProps}
							error={Boolean(form.errors.axisZ)}
							helperText={form.errors.axisZ}
							label="z (mm)"
							value={axisZ}
							onChange={this.handlePointChange(field.onChange, field.name)}
						/>
					)} />
				</Form>
			</Formik>
		);
	}
}
