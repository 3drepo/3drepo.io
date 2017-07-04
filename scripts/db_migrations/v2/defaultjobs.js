var jobs = [
	{ _id: 'Client' },
	{ _id: 'Architect'},
	{ _id: 'Structural Engineer'},
	{ _id: 'MEP Engineer'},
	{ _id: 'Project Manager'},
	{ _id: 'Quantity Surveyor'},
	{ _id: 'Asset Manager'},
	{ _id: 'Main Contractor'},
	{ _id: 'Supplier'}
];


print('Default jobs:');
// generate default permission templates 
db.getSiblingDB('admin').system.users.update({}, { '$addToSet': {
        'customData.jobs': { '$each': jobs }
    } 
}, { multi: true});

print('Done.');