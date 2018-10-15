const path = require('path');

const templatesPath = path.join(__dirname, 'templates');

module.exports = (plop) => {
  const containerDirectory = 'routes/{{ directory }}/{{ camelCase name }}';
  plop.setGenerator('React component', {
    description: 'Generate a Redux component',
    prompts: [{
      type: 'input',
      name: 'name',
      message: 'Name:',
    }, {
      type: 'directory',
      name: 'directory',
      basePath: 'routes',
      message: 'Container\'s directory:',
    }],
    actions: [{
      type: 'add',
      path: `${containerDirectory}/{{ camelCase name }}.component.tsx`,
      templateFile: path.join(templatesPath, 'component.hbs'),
    }, {
      type: 'add',
      path: `${containerDirectory}/{{ camelCase name }}.styles.ts`,
      templateFile: path.join(templatesPath, 'styles.hbs'),
    }],
  });
};
