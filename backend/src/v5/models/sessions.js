 const db = require('../handler/db');
 
 const Sessions = {};
 const COLL_NAME = 'sessions';
 
 const sessionQuery = (query, projection, sort) => db.find('admin', COLL_NAME, query, projection, sort);
 
 Sessions.getSessionsByUsername = async (username, projection) => {
    return await sessionQuery({ user: username }, projection);     
 };

 Sessions.removeSessions = async (ids) => {
    return await db.deleteMany('admin', COLL_NAME, { _id : { $in: ids } } );
 }

 module.exports = Sessions;
 