const extractDefaultMessages = require('./extractDefaultMessages');
const config = require('./config.json');
const {getMessagesPath, getMessages} = require('./utils');

const fs = require('fs');

const OUT_DIR = config.outDir;
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
	const oldLangMessages = getMessages(language, outDir);
	const messagesToWrite = mergeMessages( oldLangMessages, purgedMessages);
	fs.writeFileSync(getMessagesPath(language, outDir),messagesToString(messagesToWrite));
}

const extract = async ( defaultLanguage, languages, outDir) => {
	const oldDefaultMessages = getMessages(defaultLanguage, outDir);
	const newDefaultMessages = formatMessages(await extractDefaultMessages());

	// Writes default language
	fs.writeFileSync(getMessagesPath(defaultLanguage, outDir),  messagesToString(mergeMessages(oldDefaultMessages, newDefaultMessages)));

	// Writes rest of the languages
	const purgedMessages = purgeUnchangedMessages(oldDefaultMessages, newDefaultMessages);

	languages = removeElement(languages, defaultLanguage);
	languages.forEach(lang => writeUntranslatedMessages(lang, purgedMessages, outDir));
}

extract(DEFAULT_LANGUAGE, LANGUAGES, OUT_DIR);

