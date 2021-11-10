const extractDefaultMessages = require('./extractDefaultMessages');

const fs = require('fs');
const os = require('os');
const path = require('path');

const OUT_DIR = 'src/locales';
const LANGUAGES = ['en', 'es'];
const DEFAULT_LANGUAGE = 'en';

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

const getMessagesPath = (language, outDir) => path.join(process.cwd(), outDir, language, 'messages.json');

const messagesToString = (messages) => {
	const orderedMessages = Object.keys(messages).sort().reduce((ordered, key) => {
		ordered[key] = messages[key];
		return ordered;
	}, {});
	return JSON.stringify(orderedMessages, null, '  ');
}

const writeUntranslatedMessages = (language, purgedMessages, outDir) => {
	const langOutdir = getMessagesPath(language, outDir);
	const oldLangMessages = require(langOutdir);
	const messagesToWrite = mergeMessages( oldLangMessages, purgedMessages);
	fs.writeFileSync(getMessagesPath(language, outDir),messagesToString(messagesToWrite));
}

const extract = async ( defaultLanguage, languages, outDir) => {
	const oldDefaultMessages = require(getMessagesPath(defaultLanguage, outDir));
	const newDefaultMessages = formatMessages(await extractDefaultMessages());

	// Writes default language
	fs.writeFileSync(getMessagesPath(defaultLanguage, outDir),  messagesToString(mergeMessages(oldDefaultMessages, newDefaultMessages)));

	// Writes rest of the languages
	const purgedMessages = purgeUnchangedMessages(oldDefaultMessages, newDefaultMessages);

	languages = removeElement(languages, defaultLanguage);
	languages.forEach(lang => writeUntranslatedMessages(lang, purgedMessages, outDir));
}

extract(DEFAULT_LANGUAGE, LANGUAGES, OUT_DIR);

