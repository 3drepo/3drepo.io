 const TicketLogs = {};

 const TICKETLOGS_COL = 'tickets.logs';
 const db = require('../handler/db');
const { generateUUID } = require('../utils/helper/uuids');
 
 TicketLogs.addTicketLog = async (teamspace, ticketLog) => {
    const _id = generateUUID();
    const date = ticketLog.to.properties["Updated at"];

    delete ticketLog.to.properties["Updated at"];    
    if (Object.keys(ticketLog.to.properties).length === 0){
      delete ticketLog.to.properties;
    }
    
    await db.insertOne(teamspace, TICKETLOGS_COL, { ...ticketLog, _id, date });
 };

 
 module.exports = TicketLogs;
 