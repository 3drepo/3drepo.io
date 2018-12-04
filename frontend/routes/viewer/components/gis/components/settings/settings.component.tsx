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
import { withFormik } from 'formik';

import { SettingsForm, SettingsSchema } from './../settingsForm/settingsForm.component';

interface IProps {
	values: {
		surveyPoints: any[];
		angleFromNorth: number;
	};
	updateModelSettings: (modelData, settings) => void;
	getDataFromPathname: () => { teamspace, modelId, revision };
}

export class Settings extends React.PureComponent<IProps, any> {
	public getFormValues = (settings) => {
		let formValues = {} as any;

		if (settings.surveyPoints && settings.surveyPoints.length) {
			const [{
				position: [axisX, axisY, axisZ],
				latLong: [latitude, longitude]
			}] = settings.surveyPoints;

			formValues = { axisX, axisY, axisZ, latitude, longitude };
		}

		formValues.angleFromNorth = settings.angleFromNorth || 0;

		return formValues;
	}

	public renderForm = () => {
		const Form = withFormik({
			mapPropsToValues: () => ( this.getFormValues(this.props.values)),
			handleSubmit: (values) => {
				const { angleFromNorth, axisX, axisY, axisZ, latitude, longitude } = values;

				const pointsSettings = {
					angleFromNorth,
					surveyPoints: [{
						position: [axisX, axisY, axisZ],
						latLong: [latitude, longitude]
					}]
				};

				const { teamspace, modelId } = this.props.getDataFromPathname();
				const project = localStorage.getItem('lastProject');
				const modelData = { teamspace, project, modelId };

				this.props.updateModelSettings(modelData, pointsSettings);
			},
			validationSchema: SettingsSchema
		})(SettingsForm);

		return <Form />;
	}

	public render() {
		return this.renderForm();
	}
}
