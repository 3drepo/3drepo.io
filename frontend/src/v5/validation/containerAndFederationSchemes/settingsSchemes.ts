/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import * as Yup from 'yup';
import { formatMessage } from '@/v5/services/intl';
import { EMPTY_VIEW } from '@/v5/store/store.helpers';
import { unit, code, nullableNumberField } from './validators';
import { desc, name } from '../shared/validators';
import { isNumber } from 'lodash';

export const SettingsSchema = Yup.object().shape({
	name,
	desc,
	unit,
	code,
});

export const SettingsSchemaWithGeoPosition = SettingsSchema.shape({
	defaultView: Yup.string()
		.nullable()
		.transform((value) => (value === EMPTY_VIEW._id ? null : value)),
	latitude: nullableNumberField,
	longitude: nullableNumberField,
	angleFromNorth: nullableNumberField
		.min(0,
			formatMessage({
				id: 'settings.angle.error.min',
				defaultMessage: 'Angle cannot be smaller than 0',
			}))
		.max(360,
			formatMessage({
				id: 'settings.angle.error.max',
				defaultMessage: 'Angle cannot be greater than 360',
			})),
	x: nullableNumberField,
	y: nullableNumberField,
	z: nullableNumberField,
}).test(
	'allOrNoneGISValues',
	formatMessage({
		id: 'validation.settings.GIS.error.allOrNone',
		defaultMessage: 'GIS Values must either all be provided or all empty',
	}),
	(value) => {
		const surveyPointFields = [value.latitude, value.longitude, value.angleFromNorth, value.x, value.y, value.z];
		return surveyPointFields.every((val) => isNumber(val)) || surveyPointFields.every((val) => !isNumber(val));
	},
);
