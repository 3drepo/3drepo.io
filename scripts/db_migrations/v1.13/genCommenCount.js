db.adminCommand({listDatabases:1}).databases.forEach(function(database){
    
    var dbCur = db.getSiblingDB(database.name);
    dbCur.getCollectionNames().forEach(function(collection){
        if(collection.endsWith('.issues')){
            
            var collCur = dbCur.getCollection(collection);
            collCur.find().forEach(function(issue){
                if(Array.isArray(issue.comments)){
                    collCur.update({_id: issue._id}, { '$set' : { commentCount: issue.comments.length } });
                }
            })
        }
    });
});