const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { srcFiles } = require('./config.json');

const extractDefaultMessages = () =>
	new Promise((resolve, reject) => {
		const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'extract'));
		const process = exec([
				'yarn formatjs extract',
				srcFiles,
				`--out-file ${tmpDir}/messages.json`
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

module.exports = extractDefaultMessages;
