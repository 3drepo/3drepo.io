const { exec } = require('child_process');
const { writeFileSync, rmSync } = require('fs');
const path = require('path');

const config = require('./config.json');
const {getRelativeMessagesPath, getMessagesPath, requireFileIfExists, capitalize, removeElement} = require('./utils')

const compiledFilename = (lang) => `compiled${lang}.json`;


const compileMessages = (lang, catalogsDir, compileDir) =>
	new Promise((resolve, reject) => {
		const process = exec([
				'yarn formatjs compile',
				`--ast ${getRelativeMessagesPath(lang, catalogsDir)}`,
				`--out-file  ${getRelativeMessagesPath(lang, compileDir, compiledFilename(lang))}`,
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
	const jsonContent = requireFileIfExists(lang, dir, compiledFilename(lang));
	const tsContent = `/*eslint-disable*/ export const messages${capLang} = ${JSON.stringify(jsonContent)};`;
	writeFileSync(getMessagesPath(lang, dir, `messages${capLang}.ts`), tsContent);
	rmSync(getMessagesPath(lang, dir, compiledFilename(lang)));
}

const compile = async () => {
	const languages = removeElement(config.languages, config.defaultLanguage);
	for (lang of languages){
		await compileMessages(lang, config.catalogsDir, config.compileDir);
		convertJSONToTS(lang, config.compileDir);
	};
};

compile();



