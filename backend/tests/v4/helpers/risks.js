const DEFAULT_RISK_DATA = {
	name: 'risk name',
	safetibase_id: '12456-abcdef',
	associated_activity: 'replacement',
	desc: 'Sample description',
	viewpoint: {
		up: [0, 1, 0],
		position: [38, 38, 125.08011914810137],
		look_at: [0, 0, -163.08011914810137],
		view_dir: [0, 0, -1],
		right: [1, 0, 0],
		fov: 2.1124830653010416,
		aspect_ratio: 0.8750189337327384,
		far: 276.75612077194506,
		near: 76.42411012233212,
	},
	assigned_roles: ['roleB'],
	category: 'other issue',
	likelihood: 0,
	consequence: 0,
	mitigation_status: 'proposed',
	mitigation_desc: 'Task123',
	mitigation_detail: 'Task123 - a more detailed description',
	mitigation_stage: 'Stage 1',
	mitigation_type: 'Type B',
	element: 'Doors',
	risk_factor: 'Factor 9',
	scope: 'Scope 3',
	location_desc: 'Rooftop',
};

const createRisk = (account, modelId) => (agent, riskData = null) => (...args) => {
	const next = args.pop();

	agent.post(`/${account}/${modelId}/risks`)
		.send({ ...DEFAULT_RISK_DATA, ...(riskData || {}) })
		.expect(200, (err, res) => next(err, res.body));
};

module.exports = {
	createRisk,
};
