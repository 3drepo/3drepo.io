const { existsSync, mkdirSync, writeFileSync } = require('fs');
const path = require('path');

const getRelativeMessagesPath = (language, outDir, filename) =>  `${outDir}/${language}/${filename || 'messages.json'}`

const getMessagesPath = (language, outDir, filename) => path.join(process.cwd(), outDir, language, filename || 'messages.json');

const requireFileIfExists = (language, dir, filename)  => {
	const path = getMessagesPath(language, dir, filename);
	return existsSync(path) ? require(path) : {};
}

const writeFileSyncWithDirs = ( filename, data) => {
	const dirName = path.dirname(filename);
	if (!existsSync(dirName)){
		mkdirSync(dirName, { recursive: true });
	}

	writeFileSync(filename, data);
}

const capitalize = (str) => `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;

module.exports =  { getMessagesPath, getRelativeMessagesPath, requireFileIfExists, writeFileSyncWithDirs, capitalize };