
const getStats = (oldMessages, newMessages) =>
({
	added:0,
	removed:0,
	unchanged:0,
})

const showStats = (stats) => console.log(JSON.stringify(stats, null, '\t'));
