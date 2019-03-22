import { map } from 'lodash';
import { IMetaRecord } from '../modules/bim/bim.redux';

export const prepareMetadata = (metadata: IMetaRecord[]) => {
	return map(metadata, (value, key) => ({ key, value }));
};
