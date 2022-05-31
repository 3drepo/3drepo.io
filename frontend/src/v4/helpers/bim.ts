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

import { map, merge } from 'lodash';
import { IMetaRecordList } from '../modules/bim/bim.redux';
import { FILTER_TYPES } from '../routes/components/filterPanel/filterPanel';

export const prepareMetadata = (metadata: IMetaRecordList) => {
	return map(metadata, (value, key) => {
		return {
			key,
			value,
			categories: key.split('::'),
		};
	});
};

export const getFilters = (metaKeys) => {
	return [{
		type: FILTER_TYPES.QUERY,
		values: metaKeys.map((key) => ({
			label: key,
			value: key
		}))
	}];
};

const setValueToField = (fields, value) => fields
	.reduceRight((acc, crr, index, arr) => ({
		[crr]: index + 1 < arr.length ? acc : value,
	}), {});

export const transformMetadataToNestedList = (metadata) => metadata.reduce((acc, crr) =>
	merge(setValueToField(crr.categories, crr), acc)
, {});

export const sortMetadata = ([nameA, dataA], [nameB, dataB]) => {
	if (!!dataA.key > !!dataB.key) {
		return -1;
	}
	if (!!dataA.key < !!dataB.key) {
		return 1;
	}

	if (nameA < nameB) {
		return -1;
	}
	if (nameA > nameB) {
		return 1;
	}
};

