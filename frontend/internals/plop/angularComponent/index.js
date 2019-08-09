const {join} = require("path");
const templatesPath = join(__dirname, "templates");

module.exports = (plop) => {
	const containerDirectory = "components/{{ directory }}/{{ dashCase name }}";
	plop.setGenerator("Angular component", {
		description: "Generate a Angular component",
		prompts: [{
			type: "input",
			name: "name",
			message: "Name:",
		}, {
			type: "directory",
			name: "directory",
			basePath: "components",
			message: "Components\"s directory:",
		}],
		actions: [{
			type: "add",
			path: `${containerDirectory}/js/{{ dashCase name }}.component.ts`,
			templateFile: join(templatesPath, "component.hbs"),
		}, {
			type: "add",
			path: `${containerDirectory}/css/{{ dashCase name }}.css`,
			templateFile: join(templatesPath, "styles.hbs"),
		}, {
			type: "add",
				path: `${containerDirectory}/resources/pug/{{ dashCase name }}.pug`,
			templateFile: join(templatesPath, "template.hbs"),
		}],
	});
};