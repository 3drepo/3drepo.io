import { get } from 'lodash';
import memoizeOne from 'memoize-one';

export const getActiveRevisions = memoizeOne((revisions) => {
	return revisions.filter((revision) => !revision.void);
});

export const getCurrentRevisionId = memoizeOne((revisions) => {
	const activeRevisions = getActiveRevisions(revisions);
	return get(activeRevisions[0], '_id');
});
