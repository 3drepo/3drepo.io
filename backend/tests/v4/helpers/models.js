// v5/processors/teamspaces/projects/models/commons/modelList
const {addModel} = require('../../../src/v5/models/modelSettings')

const DEFAULT_OPTIONS = { desc: "desc", unit: "m", type: "type", project:"project1" };

const createModel = async (agent, account, project, name, options) => {
	const test = await addModel(account,project,  { name, ...DEFAULT_OPTIONS, ...options})
	return test
};

module.exports = {
	createModel,
};