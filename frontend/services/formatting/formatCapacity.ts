/**
 *  Copyright (C) 2021 3D Repo Ltd
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

export const formatBytesGB = (input: number = 0) => {
	const factor: number = 1024;
	const units: string = 'GB';

	return (Math.round((input / factor) * 100) / 100).toString() + units;
};

export const formatBytes = (input: number = 0, referenceValue: number) => {
	const bytesInMB: number = 1048576;
	const bytesInGB: number = 1073741824;
	let factor: number;

	let units: string;

	if (referenceValue !== undefined || referenceValue !== null) {
		if (referenceValue > 1073741824) {
			factor = bytesInGB;
			units = ' GB';
		} else {
			factor = bytesInMB;
			units = ' MB';
		}
	} else {
		if (input > 1073741824) {
			factor = bytesInGB;
			units = ' GB';
		} else {
			factor = bytesInMB;
			units = ' MB';
		}
	}

	return (Math.round((input / factor) * 100) / 100).toString() + units;
};
