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
import byteSize from 'byte-size';
import { formatMessage } from '../services/intl';

type ByteSizeType = {
	value: number,
	unit: string
};

const InformationUnits = {
	kB: formatMessage({ id: 'units.information.kB', defaultMessage: 'kB' }),
	MB: formatMessage({ id: 'units.information.MB', defaultMessage: 'MB' }),
	GB: formatMessage({ id: 'units.information.GB', defaultMessage: 'GB' }),
	TB: formatMessage({ id: 'units.information.TB', defaultMessage: 'TB' }),
	PB: formatMessage({ id: 'units.information.PB', defaultMessage: 'PB' }),
	EB: formatMessage({ id: 'units.information.EB', defaultMessage: 'EB' }),
	ZB: formatMessage({ id: 'units.information.ZB', defaultMessage: 'ZB' }),
	YB: formatMessage({ id: 'units.information.YB', defaultMessage: 'YB' }),
	KiB: formatMessage({ id: 'units.information.KiB', defaultMessage: 'KiB' }),
	MiB: formatMessage({ id: 'units.information.MiB', defaultMessage: 'MiB' }),
	GiB: formatMessage({ id: 'units.information.GiB', defaultMessage: 'GiB' }),
	TiB: formatMessage({ id: 'units.information.TiB', defaultMessage: 'TiB' }),
	PiB: formatMessage({ id: 'units.information.PiB', defaultMessage: 'PiB' }),
	EiB: formatMessage({ id: 'units.information.EiB', defaultMessage: 'EiB' }),
	ZiB: formatMessage({ id: 'units.information.ZiB', defaultMessage: 'ZiB' }),
	YiB: formatMessage({ id: 'units.information.YiB', defaultMessage: 'YiB' }),
};

export const formatInfoUnit = (value: number): string => {
	const formattedSize = byteSize(value) as ByteSizeType;
	formattedSize.unit = InformationUnits[formattedSize.unit];

	return formatMessage({
		id: 'units.information.format',
		defaultMessage: '{value} {unit}',
	}, formattedSize);
};
