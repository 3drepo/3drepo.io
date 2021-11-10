const { existsSync } = require('fs');
const path = require('path');

const getMessagesPath = (language, outDir) => path.join(process.cwd(), outDir, language, 'messages.json');

const getMessages = (language, outDir)  => {
	const path = getMessagesPath(language, outDir);
	return existsSync(path) ? require(path) : {};
}

module.exports =  { getMessagesPath, getMessages };