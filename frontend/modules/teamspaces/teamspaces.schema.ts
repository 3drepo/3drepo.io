import { schema } from 'normalizr';

const idAttribute = (field = '_id') => (data) => data[field];

const model = new schema.Entity('models', {}, {
	idAttribute: idAttribute('model'),
	processStrategy: (value, parent) => {
		return {
			...value,
			projectName: parent._id
		};
	}
});

const project = new schema.Entity('projects', {
	models: [model]
}, {
	idAttribute: idAttribute('_id'),
	processStrategy: (value, parent) => {
		return {
			...value,
			teamspace: parent.account
		};
	}
});

export const teamspacesSchema = new schema.Entity('teamspaces', {
	projects: [project]
}, {
	idAttribute: idAttribute('account')
});
