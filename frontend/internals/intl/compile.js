const { exec } = require('child_process');
const path = require('path');

const config = require('./config.json');
const {getMessagesPath} = require('./utils')


// yarn compile lang/fr.json --ast --out-file compiled-lang/fr.json --format formatter.js
const compileMessages = (lang, outdir) =>
	new Promise((resolve, reject) => {
		const process = exec([
				'yarn formatjs compile',
				'--ast src/locales/en/messages.json',
				`--out-file ${getMessagesPath(lang,outdir)}.c.json`,
				`--format ${path.join(__dirname, 'formatter.js')}`
			].join(' ' )
			, (err, stdout, stderr) => {
			if (err) {
				console.log(`stderr: ${stderr}`);
				reject(err);
				return null;
			}

			const messages = require(`${tmpDir}/messages.json`);
			fs.rmSync(tmpDir, { recursive: true });

			resolve(messages);
		});

		process.stdout.on('data', console.log);
		process.stderr.on('data', console.error);
});

compileMessages('en', config.outDir)
