const promptDirectory = require('inquirer-directory');
const addAngularComponentGenerator = require('./internals/plop/angularComponent');
const addReactComponentGenerator = require('./internals/plop/reactComponent');
const addReduxContainerGenerator = require('./internals/plop/reduxContainer');
const addReduxModuleGenerator = require('./internals/plop/reduxModule');

module.exports = function (plop) {
	plop.setPrompt('directory', promptDirectory);

	addAngularComponentGenerator(plop);
	addReactComponentGenerator(plop);
	addReduxContainerGenerator(plop);
	addReduxModuleGenerator(plop);
};