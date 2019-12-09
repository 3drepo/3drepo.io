const dateFormat = require('dateformat');

Utils = {};

Utils.formatDate = (date) => {
	return dateFormat(date, "dd-mm-yy");
}

Utils.generateFileName = (prefix) => {
	const date = Utils.formatDate(new Date());
	return `${prefix}_${date}.csv`;
}

Utils.skipUser = (username) => {
	return username === "adminUser" || username === "nodeUser";
}

module.exports = Utils;
