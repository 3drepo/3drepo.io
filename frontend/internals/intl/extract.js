const { exec, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const filesGlob = 'src/**/*[!.d].{ts,tsx}';
const OUT_DIR = 'src/locales';
const LANGUAGES = ['en', 'es'];

const extractLanguage = (language) =>
	new Promise((resolve, reject) => {
		const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'extract'));
		const process = exec([
				'yarn formatjs extract',
				filesGlob,
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

const mergeMessages = (oldMessages, newMessages) => ({...newMessages, ...oldMessages});

const getMessagesPath = (language, outDir) => path.join(process.cwd(), outDir, language, 'messages.json');

const showStats = (stats) => console.log(JSON.stringify(stats, null, '\t'));

const getStats = (oldMessages, newMessages) =>
({
	added:0,
	removed:0,
	unchanged:0,
})

const extract = async (languages, outdir) => {
	for (let i = 0; i < languages.length ; i++) {
		const lang = languages[i];
		const oldMessages = require(getMessagesPath(lang, outdir));
		const newMessages = await extractLanguage(lang);
		fs.writeFileSync(getMessagesPath(lang, outdir),  JSON.stringify(mergeMessages(oldMessages, newMessages), null, '\t'));

		if (i == languages.length-1) {
			const messagesStats = await getStats(oldMessages, newMessages);
			showStats(messagesStats);
		}
	}
}

extract(LANGUAGES,OUT_DIR);

// extractLanguage('en').then(msgs => console.log(msgs));

