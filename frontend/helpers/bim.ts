import { map } from 'lodash';
import { IMetaRecord } from '../modules/bim/bim.redux';
import { FILTER_TYPES } from '../routes/components/filterPanel/filterPanel.component';

export const prepareMetadata = (metadata: IMetaRecord[]) => {
	return map(metadata, (value, key) => ({ key, value }));
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
