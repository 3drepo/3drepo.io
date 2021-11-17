const extractDefaultMessages = require('./extractDefaultMessages');
const config = require('./config.json');
const {getMessagesPath, requireFileIfExists, writeFileSyncWithDirs, removeElement} = require('./utils');

const CATALOGS_DIR = config.catalogsDir;
const LANGUAGES = config.languages;
const DEFAULT_LANGUAGE = config.defaultLanguage;


const formatMessages = (messagesObj) => Object.keys(messagesObj)
	.reduce((formatted, key) => {
		formatted[key] = messagesObj[key].defaultMessage;
		return formatted;
},{});

const messagesToString = (messages) => {
	const orderedMessages = Object.keys(messages).sort().reduce((ordered, key) => {
		ordered[key] = messages[key];
		return ordered;
	}, {});
	return JSON.stringify(orderedMessages, null, '  ');
}


const getMessagesDiff = (oldMessages, newMessages) => {
	const mergedData = {...oldMessages, ...newMessages};

	return Object.keys(mergedData).map(id=> {
		const added = newMessages.hasOwnProperty(id) && !oldMessages.hasOwnProperty(id);
		const removed = !newMessages.hasOwnProperty(id) && oldMessages.hasOwnProperty(id);
		const changed = newMessages.hasOwnProperty(id) && oldMessages.hasOwnProperty(id) && newMessages[id] !== oldMessages[id];

		return {
			id,
			added,
			removed,
			changed
		}
	});
}

const processMessages = (messages, messagesDiff) => {
	const newMessages = {};

	messagesDiff.forEach(({id, changed, added, removed}) => {
		if (!removed){
			newMessages[id] = messages[id] || '';
		}

		if (changed) {
			newMessages[id] = '';
		}
	});

	return newMessages;
};

const writeUntranslatedMessages = (language, mesagesDiff, outDir) => {
	const oldLangMessages = requireFileIfExists(language, outDir);
	const messagesToWrite = processMessages( oldLangMessages, mesagesDiff);
	writeFileSyncWithDirs(getMessagesPath(language, outDir), messagesToString(messagesToWrite));
}

const extract = async ( defaultLanguage, languages, outDir) => {
	const oldDefaultMessages = requireFileIfExists(defaultLanguage, outDir);
	const newDefaultMessages = formatMessages(await extractDefaultMessages());

	// Writes default language
	writeFileSyncWithDirs(getMessagesPath(defaultLanguage, outDir),  messagesToString(newDefaultMessages));

	const messagesDiff = getMessagesDiff(oldDefaultMessages, newDefaultMessages);

	languages = removeElement(languages, defaultLanguage);
	languages.forEach(lang => writeUntranslatedMessages(lang, messagesDiff, outDir));
}

extract(DEFAULT_LANGUAGE, LANGUAGES, CATALOGS_DIR);

