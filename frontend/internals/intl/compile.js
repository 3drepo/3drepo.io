const { exec } = require('child_process');
const path = require('path');

const config = require('./config.json');
const {getRelativeMessagesPath} = require('./utils')


// yarn compile lang/fr.json --ast --out-file compiled-lang/fr.json --format formatter.js
const compileMessages = (lang, outdir) =>
	new Promise((resolve, reject) => {
		const process = exec([
				'yarn formatjs compile',
				`--ast ${getRelativeMessagesPath(lang, outdir)}`,
				`--out-file  ${getRelativeMessagesPath(lang, outdir, 'compiled.json')}`,
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

compileMessages('en', config.outDir)
