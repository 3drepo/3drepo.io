const promptDirectory = require('inquirer-directory');
const addAngularComponentGenerator = require('./internals/plop/angularComponent');
const addReactClassComponentGenerator = require('./internals/plop/reactClassComponent');
const addReactFunctionalComponentGenerator = require('./internals/plop/reactFunctionalComponent');
const addReduxContainerGenerator = require('./internals/plop/reduxContainer');
const addReduxModuleGenerator = require('./internals/plop/reduxModule');

module.exports = function (plop) {
	plop.setPrompt('directory', promptDirectory);

	addAngularComponentGenerator(plop);
	addReactClassComponentGenerator(plop);
	addReactFunctionalComponentGenerator(plop);
	addReduxContainerGenerator(plop);
	addReduxModuleGenerator(plop);
};