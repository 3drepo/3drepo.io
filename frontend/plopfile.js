const promptDirectory = require('inquirer-directory');
const addReactComponentGenerator = require('./internals/plop/reactComponent');
const addReduxContainerGenerator = require('./internals/plop/reduxContainer');
const addReduxModuleGenerator = require('./internals/plop/reduxModule');

module.exports = function (plop) {
	plop.setPrompt('directory', promptDirectory);

	addReactComponentGenerator(plop);
	addReduxContainerGenerator(plop);
	addReduxModuleGenerator(plop);
};
