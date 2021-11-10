exports.compile = function (msgs) {
	const results = {}
	console.log(msgs);

	for (const [id, msg] of Object.entries(msgs)) {
	  results[id] = msg.string
	}
	return results
  }