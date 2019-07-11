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

import { withFormik } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import { convertPositionToDirectX, convertPositionToOpenGL } from '../../../../../../helpers/model';
import { schema } from '../../../../../../services/validation';

import { SettingsForm } from './../settingsForm/settingsForm.component';

const SettingsSchema = Yup.object().shape({
	longitude: schema.measureNumberDecimal,
	latitude: schema.measureNumberDecimal,
	elevation: schema.measureNumberDecimal,
	angleFromNorth: schema.measureNumberDecimal,
	axisY: schema.measureNumberDecimal,
	axisX: schema.measureNumberDecimal,
	axisZ: schema.measureNumberDecimal
});

interface IProps {
	values: {
		surveyPoints: any[];
		angleFromNorth: number;
	};
	properties: {
		unit: string;
	};
	updateModelSettings: (modelData, settings) => void;
	getDataFromPathname: () => { teamspace, modelId, revision };
}

export class Settings extends React.PureComponent<IProps, any> {
	public getFormValues = (settings) => {
		let formValues = {} as any;

		if (settings.surveyPoints && settings.surveyPoints.length) {
			const [axisX, axisY, axisZ] = convertPositionToOpenGL(settings.surveyPoints[0].position);
			const [latitude, longitude] = settings.surveyPoints[0].latLong;

			formValues = { axisX, axisY, axisZ, latitude, longitude };
		}

		formValues.angleFromNorth = settings.angleFromNorth || 0;

		return formValues;
	}

	public renderForm = () => {
		const props = {
			unit: this.props.properties.unit
		} as any;

		const Form = withFormik({
			mapPropsToValues: () => ( this.getFormValues(this.props.values)),
			handleSubmit: (values) => {
				const { angleFromNorth, axisX, axisY, axisZ, latitude, longitude } = values;
				const pointsSettings = {
					angleFromNorth: Number(angleFromNorth),
					surveyPoints: [{
						position: convertPositionToDirectX([axisX, axisY, axisZ]),
						latLong: [latitude, longitude].map(Number)
					}]
				};

				const { teamspace, modelId } = this.props.getDataFromPathname();
				const modelData = { teamspace, modelId };

				this.props.updateModelSettings(modelData, pointsSettings);
			},
			validationSchema: SettingsSchema
		})(SettingsForm);

		return <Form {...props} />;
	}

	public render() {
		return this.renderForm();
	}
}
