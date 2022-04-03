db.adminCommand({listDatabases:1, nameOnly: true}).databases.forEach(function(database){    
    var dbName = database.name;
    var dbCur = db.getSiblingDB(dbName);
    var collection = dbCur.getCollection('jobs');
    var existingAdminJob = collection.findOne({ _id: 'Admin' }, { _id: 1 }); 

    if(!existingAdminJob){
        collection.insertOne({ _id: 'Admin', color: '#f7f7b2', users: [ dbName ] });
    } else if (!existingAdminJob.users.includes(dbName)){
        collection.updateOne({ _id: 'Admin' }, { $push: { users: dbName } });
    }
});