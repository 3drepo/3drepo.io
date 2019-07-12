import { schema } from 'normalizr';

const idAttribute = (field = '_id') => (data) => data[field];

const model = new schema.Entity('models', {}, {
	idAttribute: idAttribute('model')
});

const project = new schema.Entity('projects', {
	models: [model]
}, {
	idAttribute: idAttribute('_id')
});

export const teamspacesSchema = new schema.Entity('teamspaces', {
	projects: [project]
}, {
	idAttribute: idAttribute('account')
});
