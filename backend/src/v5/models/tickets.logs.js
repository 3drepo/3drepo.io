 const TicketLogs = {};

 const TICKETLOGS_COL = 'tickets.logs';
 const db = require('../handler/db');
const { generateUUID } = require('../utils/helper/uuids');
 
 TicketLogs.addTicketLog = async (teamspace, ticketLog) => {
    const _id = generateUUID();
    await db.insertOne(teamspace, TICKETLOGS_COL, { ...ticketLog, _id });
 };

 
 module.exports = TicketLogs;
 