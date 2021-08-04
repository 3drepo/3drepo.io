const DEFAULT_OPTIONS = { desc: "desc", unit: "m", type: "type", project:"project1" };

const promiseCallBack =  (resolve, reject) => (err ,res) => {
	if (err) reject(err)
	else resolve(res);
}

const model_endpoint = (account, model='model') => `/${account}/${model}`;

const createModel = (agent, account, modelName, options) => {
	return new Promise((resolve, reject) => {
		agent.post(model_endpoint(account))
			.send({ modelName, ...DEFAULT_OPTIONS, ...options})
			.expect(200, promiseCallBack(resolve, reject));
	});
};

const createFederation = (agent, account, name, subModels) => createModel(agent, account, name, {subModels});

const updateFederation = (agent, account, modelId, subModels) => {
	return new Promise((resolve, reject) => {
		agent.put(model_endpoint(account,modelId))
			.send({subModels})
			.expect(200, promiseCallBack(resolve, reject));
	});
};

module.exports = {
	createModel,
	createFederation,
	updateFederation
};