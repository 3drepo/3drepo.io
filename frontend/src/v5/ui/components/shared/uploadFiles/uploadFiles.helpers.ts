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

import { createFilterOptions } from '@mui/material';
import { orderBy } from 'lodash';

export const reduceFileData = (files) => files.map(({ file: { name, size }, ...rest }) => ({ file: { name, size }, ...rest }));

export const parseFilename = (filename: string, maxLength: number): string => {
	const baseName = filename.split('.').slice(0)[0];
	const noSpecialChars = baseName.replace(/[^a-zA-Z0-9_\- ]/g, '');
	const noSpaces = noSpecialChars.replace(/ /g, '_');
	const noExceedingMax = noSpaces.substring(0, maxLength);
	return noExceedingMax;
};

export const getFilteredDestinationOptions = createFilterOptions({ trim: true });

export const sortByName = (options) => orderBy(options, ({ name }) => name.toLowerCase());