print('cache timestamp and subModels in model setting');


db.getSiblingDB('admin').adminCommand({listDatabases:1}).databases.forEach(function(database){

	var myDb = db.getSiblingDB(database.name);
    print('DB: ' + database.name + ' ----------------------------------');
	myDb.getCollection('settings').find().forEach(function(setting){
        if(!setting.timestamp){
            print('processing model ' + setting._id + ' ' + setting.name);
            
            var history = myDb.getCollection(setting._id + '.history').find({}).sort({ timestamp: -1}).limit(1)[0];
            var subModels = [];

            // if it is a fed model, cache the sub models as well
            if(history && setting.federate){
                myDb.getCollection(setting._id + '.scene').find({type: 'ref', _id: { '$in': history.current } }).forEach(function(ref){
                    subModels.push({ model: ref.project, database: ref.owner});
                });
            }

            if(history){

                var updateObj = {
                    '$set': {
                        'timestamp': history.timestamp
                    }
                };

                if(subModels.length){
                    updateObj['$set']['subModels'] = subModels;
                }

                myDb.getCollection('settings').update({ _id: setting._id }, updateObj);
            }
                
        }
    });
});

print('Done');