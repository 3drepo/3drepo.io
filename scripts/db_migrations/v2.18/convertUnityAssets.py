import json
import gridfs
import sys
from pymongo import MongoClient

mongoURL = sys.argv[1]
mongoPort = sys.argv[2]
userName = sys.argv[3]
password = sys.argv[4]
connString = "mongodb://"+ userName + ":" + password +"@"+mongoURL + ":" + mongoPort + "/"

##### Enable dry run to not commit to the database #####
dry_run = True

##### Connect to the database #####
db = MongoClient(connString)

##### Loop through each database other than admin and local #####
for database in db.database_names():
        if database != "admin" and database != "local":
                db = MongoClient(connString)[database]
                print("--database:" + database)

##### Get a model ID #####
                for settings in db.settings.find():
                        model_id = settings.get('_id')
                        colName = model_id + ".stash.json_mpc"
                        fs = gridfs.GridFS(db, colName)
                        fs_json = fs.find({"filename" : {"$regex": "unityAssets.json$" }})

##### Get filename and IDs #####
                        for single_file in fs_json:
                                data = single_file.filename
                                print data
                                rev_id  = data[data.find("revision/")+9:data.find("/unityAssets.json")]
                                file_id = single_file._id
                                single_file = single_file.read()
                                my_file = json.loads(single_file)

##### Append Revision ID #####
                                entry = {'revId': rev_id}
                                my_file.update(entry)

##### Convert to BSON #####
                                if dry_run == False:
                                        colName = model_id + ".stash.unity3d"
                                        collection = db.colName
                                        collection.insert(my_file)
