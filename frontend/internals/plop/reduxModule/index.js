const path = require('path');

const templatesPath = path.join(__dirname, 'templates');

module.exports = (plop) => {
  plop.setGenerator('React module', {
    description: 'Generate a Redux module',
    prompts: [{
      type: 'input',
      name: 'name',
      message: 'Name:',
    }],
    actions: [{
      type: 'add',
      path: 'modules/{{ camelCase name }}/index.ts',
      templateFile: path.join(templatesPath, 'index.hbs'),
    }, {
      type: 'add',
      path: 'modules/{{ camelCase name }}/{{ camelCase name }}.redux.ts',
      templateFile: path.join(templatesPath, 'redux.hbs'),
    }, {
      type: 'add',
      path: 'modules/{{ camelCase name }}/{{ camelCase name }}.sagas.ts',
      templateFile: path.join(templatesPath, 'sagas.hbs'),
    }, {
      type: 'add',
      path: 'modules/{{ camelCase name }}/{{ camelCase name }}.selectors.ts',
      templateFile: path.join(templatesPath, 'selectors.hbs'),
    }, {
      type: 'modify',
      path: 'modules/reducers.ts',
      pattern: /(\/\/ <-- IMPORT MODULE REDUCER -->)/g,
      template: 'import { reducer as {{ camelCase name }}Reducer } from \'./{{ camelCase name }}/{{ camelCase name }}.redux\';\n$1',
    }, {
      type: 'modify',
      path: 'modules/reducers.ts',
      pattern: /(\/\/ <-- INJECT MODULE REDUCER -->)/g,
      template: ',\n		{{ camelCase name }}: {{ camelCase name }}Reducer$1',
    }, {
      type: 'modify',
      path: 'modules/sagas.ts',
      pattern: /(\/\/ <-- IMPORT MODULE SAGA -->)/g,
      template: 'import {{ pascalCase name }}Saga from \'./{{ camelCase name }}/{{ camelCase name }}.sagas\';\n$1',
    }, {
      type: 'modify',
      path: 'modules/sagas.ts',
      pattern: /(\/\/ <-- INJECT MODULE SAGA -->)/g,
      template: ',\n		fork(watch{{ pascalCase name }})$1',
    }],
  });
};
