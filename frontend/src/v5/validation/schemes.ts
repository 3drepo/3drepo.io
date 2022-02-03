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
import { EMPTY_VIEW } from '@/v5/store/federations/federations.types';

export const FederationSettingsSchema = Yup.object().shape({
	name: Yup.string()
		.min(2,
			formatMessage({
				id: 'federations.settings.name.error.min',
				defaultMessage: 'Federation Name must be at least 2 characters',
			}))
		.max(120,
			formatMessage({
				id: 'federations.settings.name.error.max',
				defaultMessage: 'Federation Name is limited to 120 characters',
			}))
		.required(
			formatMessage({
				id: 'federations.settings.name.error.required',
				defaultMessage: 'Federation Name is a required field',
			}),
		),
	desc: Yup.lazy((value) => (
		value === ''
			? Yup.string().strip()
			: Yup.string()
				.min(1,
					formatMessage({
						id: 'federations.settings.description.error.min',
						defaultMessage: 'Federation Description must be at least 1 character',
					}))
				.max(600,
					formatMessage({
						id: 'federations.settings.description.error.max',
						defaultMessage: 'Federation Description is limited to 600 characters',
					}))
	)),
	unit: Yup.string().required().default('mm'),
	code: Yup.lazy((value) => (
		value === ''
			? Yup.string().strip()
			: Yup.string()
				.min(1,
					formatMessage({
						id: 'federations.settings.code.error.min',
						defaultMessage: 'Code must be at least 1 character',
					}))
				.max(50,
					formatMessage({
						id: 'federations.settings.code.error.max',
						defaultMessage: 'Code is limited to 50 characters',
					}))
				.matches(/^[\w|_|-]*$/,
					formatMessage({
						id: 'federations.settings.code.error.characters',
						defaultMessage: 'Code can only consist of letters and numbers',
					}))
	)),
	defaultView: Yup.string()
		.nullable()
		.transform((value) => (value === EMPTY_VIEW._id ? null : value)),
	latitude: Yup.number().required(),
	longitude: Yup.number().required(),
	angleFromNorth: Yup.number()
		.min(0,
			formatMessage({
				id: 'federations.settings.angle.error.min',
				defaultMessage: 'Angle cannot be smaller than 0',
			}))
		.max(360,
			formatMessage({
				id: 'federations.settings.angle.error.max',
				defaultMessage: 'Angle cannot be greater than 360',
			}))
		.transform((value) => value ?? 0),
	x: Yup.number().required(),
	y: Yup.number().required(),
	z: Yup.number().required(),
});
