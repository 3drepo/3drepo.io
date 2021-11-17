exports.compile = (msgs) => Object.keys(msgs).reduce((compacted, key) => {
	if (msgs[key]) {
		compacted[key] = msgs[key];
	}

	return compacted;
}, {});