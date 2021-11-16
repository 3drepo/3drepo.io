const extractDefaultMessages = require('./extractDefaultMessages');
const config = require('./config.json');
const {getMessagesPath, requireFileIfExists, writeFileSyncWithDirs} = require('./utils');

const CATALOGS_DIR = config.catalogsDir;
const LANGUAGES = config.languages;
const DEFAULT_LANGUAGE = config.defaultLanguage;

const removeElement = (arr, value) => arr.filter(elem => elem!==value);

const formatMessages = (messagesObj) => Object.keys(messagesObj)
	.reduce((formatted, key) => {
		formatted[key] = messagesObj[key].defaultMessage;
		return formatted;
},{});

const purgeUnchangedMessages = (oldMessages, newMessages) => Object.keys(newMessages)
	.reduce((purged, key) => {
		if (oldMessages[key] !== newMessages[key]) {
			// It blanks updated messages
			purged[key] =  '' ;
		} // Get rids of unchanged messages

		return purged;
	},{});

//TODO: keep changed messages;
const mergeMessages = (oldMessages, newMessages) => ({...oldMessages, ...newMessages});


const messagesToString = (messages) => {
	const orderedMessages = Object.keys(messages).sort().reduce((ordered, key) => {
		ordered[key] = messages[key];
		return ordered;
	}, {});
	return JSON.stringify(orderedMessages, null, '  ');
}

const writeUntranslatedMessages = (language, purgedMessages, outDir) => {
	const oldLangMessages = requireFileIfExists(language, outDir);
	const messagesToWrite = mergeMessages( oldLangMessages, purgedMessages);
	writeFileSyncWithDirs(getMessagesPath(language, outDir),messagesToString(messagesToWrite));
}

const extract = async ( defaultLanguage, languages, outDir) => {
	const oldDefaultMessages = requireFileIfExists(defaultLanguage, outDir);
	const newDefaultMessages = formatMessages(await extractDefaultMessages());

	// Writes default language
	writeFileSyncWithDirs(getMessagesPath(defaultLanguage, outDir),  messagesToString(mergeMessages(oldDefaultMessages, newDefaultMessages)));

	// Writes rest of the languages
	const purgedMessages = purgeUnchangedMessages(oldDefaultMessages, newDefaultMessages);

	languages = removeElement(languages, defaultLanguage);
	languages.forEach(lang => writeUntranslatedMessages(lang, purgedMessages, outDir));
}

extract(DEFAULT_LANGUAGE, LANGUAGES, CATALOGS_DIR);

