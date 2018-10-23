const path = require('path');

const templatesPath = path.join(__dirname, 'templates');
const componentTemplatesPath = path.join(__dirname, '../reactComponent/templates');

module.exports = (plop) => {
  const containerDirectory = 'routes/{{ directory }}/{{ camelCase name }}';
  plop.setGenerator('React container', {
    description: 'Generate a Redux container',
    prompts: [{
      type: 'input',
      name: 'name',
      message: 'Name:',
    }, {
      type: 'directory',
      name: 'directory',
      basePath: 'routes',
      message: 'Directory',
    }],
    actions: [{
      type: 'add',
      path: `${containerDirectory}/index.ts`,
      templateFile: path.join(templatesPath, 'index.hbs'),
    }, {
      type: 'add',
      path: `${containerDirectory}/{{ camelCase name }}.container.ts`,
      templateFile: path.join(templatesPath, 'container.hbs'),
    }, {
      type: 'add',
      path: `${containerDirectory}/{{ camelCase name }}.component.tsx`,
      templateFile: path.join(componentTemplatesPath, 'component.hbs'),
    }, {
      type: 'add',
      path: `${containerDirectory}/{{ camelCase name }}.styles.ts`,
      templateFile: path.join(componentTemplatesPath, 'styles.hbs'),
    }],
  });
};
