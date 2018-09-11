const promptDirectory = require('inquirer-directory');
const addAngularComponentGenerator = require('./plop/angularComponent');

module.exports = function (plop) {
	plop.setPrompt('directory', promptDirectory);

	addAngularComponentGenerator(plop);
};