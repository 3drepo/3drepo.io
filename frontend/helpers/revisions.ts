import memoizeOne from 'memoize-one';

export const getActiveRevisions = memoizeOne((revisions) => {
	return revisions.filter((revision) => !revision.void);
});
