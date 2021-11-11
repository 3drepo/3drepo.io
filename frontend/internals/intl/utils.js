const { existsSync } = require('fs');
const path = require('path');

const getRelativeMessagesPath = (language, outDir, filename) =>  `${outDir}/${language}/${filename || 'messages.json'}`

const getMessagesPath = (language, outDir, filename) => path.join(process.cwd(), outDir, language, filename || 'messages.json');


const getMessages = (language, outDir)  => {
	const path = getMessagesPath(language, outDir);
	return existsSync(path) ? require(path) : {};
}

module.exports =  { getMessagesPath, getRelativeMessagesPath, getMessages };