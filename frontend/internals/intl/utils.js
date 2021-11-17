const { existsSync, mkdirSync, writeFileSync } = require('fs');
const path = require('path');

const capitalize = (str) => `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;

const getRelativeMessagesPath = (language, outDir, filename) =>
	`${outDir}/${filename || `messages${capitalize(language)}.json`}`

const getMessagesPath = (language, outDir, filename) =>
	path.join(process.cwd(), outDir, filename || `messages${capitalize(language)}.json`);

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

const removeElement = (arr, value) => arr.filter(elem => elem!==value);

module.exports =  { getMessagesPath, getRelativeMessagesPath, requireFileIfExists, writeFileSyncWithDirs, capitalize, removeElement };