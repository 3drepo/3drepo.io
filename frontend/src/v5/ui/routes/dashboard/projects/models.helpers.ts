/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { formatMessage } from '@/v5/services/intl';

export const MODEL_UNITS = [
	{
		value: 'mm',
		name: formatMessage({ id: 'containers.unit.name.mm', defaultMessage: 'Millimetres' }),
		abbreviation: formatMessage({ id: 'containers.unit.abbreviation.mm', defaultMessage: 'mm' }),
	},
	{
		value: 'cm',
		name: formatMessage({ id: 'containers.unit.name.cm', defaultMessage: 'Centimetres' }),
		abbreviation: formatMessage({ id: 'containers.unit.abbreviation.cm', defaultMessage: 'cm' }),
	},
	{
		value: 'dm',
		name: formatMessage({ id: 'containers.unit.name.dm', defaultMessage: 'Decimetres' }),
		abbreviation: formatMessage({ id: 'containers.unit.abbreviation.dm', defaultMessage: 'dm' }),
	},
	{
		value: 'm',
		name: formatMessage({ id: 'containers.unit.name.m', defaultMessage: 'Metres' }),
		abbreviation: formatMessage({ id: 'containers.unit.abbreviation.m', defaultMessage: 'm' }),
	},
	{
		value: 'ft',
		name: formatMessage({ id: 'containers.unit.name.ft', defaultMessage: 'Feet and Inches' }),
		abbreviation: formatMessage({ id: 'containers.unit.abbreviation.ft', defaultMessage: 'ft' }),
	},
];
