const { exec } = require('child_process');
const { writeFileSync, rmSync } = require('fs');
const path = require('path');

const config = require('./config.json');
const {getRelativeMessagesPath, getMessagesPath, requireFileIfExists, capitalize} = require('./utils')

const COMPILED_DEFAULT_NAME = 'compiled.json';

const compileMessages = (lang, catalogsDir, compileDir) =>
	new Promise((resolve, reject) => {
		const process = exec([
				'yarn formatjs compile',
				`--ast ${getRelativeMessagesPath(lang, catalogsDir)}`,
				`--out-file  ${getRelativeMessagesPath(lang, compileDir, COMPILED_DEFAULT_NAME)}`,
				`--format "${path.join(__dirname, 'formatter.js')}"`
			].join(' ' )
			, (err, stdout, stderr) => {
			if (err) {
				console.log(`stderr: ${stderr}`);
				reject(err);
				return null;
			}

			resolve(true);
		});

		process.stdout.on('data', console.log);
		process.stderr.on('data', console.error);
});

const convertJSONToTS = (lang, dir) => {
	const capLang = capitalize(lang);
	const jsonContent = requireFileIfExists(lang, dir, COMPILED_DEFAULT_NAME);
	const tsContent = `/*eslint-disable*/ export const messages${capLang} = ${JSON.stringify(jsonContent)};`;
	writeFileSync(getMessagesPath(lang, dir, `messages${capLang}.ts`), tsContent);
	rmSync(getMessagesPath(lang, dir, COMPILED_DEFAULT_NAME));
}

const compile = async () => {
	await Promise.all( config.languages.map(lang => compileMessages(lang, config.catalogsDir, config.compileDir)));
	config.languages.forEach(lang => convertJSONToTS(lang, config.compileDir));
};

compile();



