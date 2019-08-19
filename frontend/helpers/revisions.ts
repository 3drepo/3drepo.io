import { get } from 'lodash';
import memoizeOne from 'memoize-one';

export const getCurrentRevisionId = memoizeOne((revisions) => {
	return get(revisions[0], '_id');
});
