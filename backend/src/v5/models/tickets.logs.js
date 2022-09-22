const TicketLogs = {};

const TICKETLOGS_COL = 'tickets.logs';
const db = require('../handler/db');
const { generateUUID } = require('../utils/helper/uuids');

TicketLogs.addTicketLog = async (teamspace, ticketLog) => 
  db.insertOne(teamspace, TICKETLOGS_COL, { ...ticketLog, _id: generateUUID() });

module.exports = TicketLogs;
