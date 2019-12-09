const dateFormat = require('dateformat');
const fs = require('fs');

DBStats = {};

const generateFileName = () => {
	const date = dateFormat(new Date(), "dd-mm-yy");
	return `dbStats_${date}.csv`;
}

DBStats.createDBReport = async (dbConn) => {
	console.log("Creating DB statistics report...");

}

module.exports = DBStats;
