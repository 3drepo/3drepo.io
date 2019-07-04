import gridfs
import os
import sys
import re
import uuid
from pymongo import MongoClient

if len(sys.argv) <= 5:
    print("Not enough arguments.")
    print("deleteGridFSFiles.py <mongoURL> <mongoPort> <userName> <password> <localFolder>")
    sys.exit(0)

mongoURL = sys.argv[1]
mongoPort = sys.argv[2]
userName = sys.argv[3]
password = sys.argv[4]
localFolder = sys.argv[5]

missingFiles = [];

if not os.path.exists(localFolder):
    print("LocalFolder " + localFolder + " does not exist.")
    sys.exit(0)

connString = "mongodb://"+ userName + ":" + password +"@"+mongoURL + ":" + mongoPort + "/"

##### Enable dry run to not commit to the database #####
dryRun = True

##### If noChecks=True, run scripts/dbMaintenance/removeOrphanFiles.py beforehand #####
##### to ensure DB/FS integrity #####
noChecks = True

##### Connect to the database #####
db = MongoClient(connString)

##### Loop through each database other than admin and local #####
for database in db.database_names():
    if database != "admin" and database != "local" and database != "notifications":
        db = MongoClient(connString)[database]
        print("--database:" + database)

##### Get a model ID #####
        for model in db.settings.find({}, {"_id": 1}):
            modelId = model.get('_id')
            print("\t--model: " + modelId)
            for colPrefix in [".history",".stash.json_mpc", ".stash.unity3d" ]:
                colName = modelId + colPrefix
                print("\t\t---col: " + colName)

                if noChecks:
                    if not dryRun:
                        db[colName + ".files"].drop()
                        db[colName + ".chunks"].drop()
                        print("\t\t\tCollection dropped: " + colName + ".(files|chunks)")
                else:
##### Check if bson files exist on db and file store before deleting #####
                    for bson in gridfs.GridFS(db, colName).find():
                        bsonRef = db[colName + ".ref"].find_one({"_id": bson.filename})
                        if bsonRef:
                            if bsonRef["link"]:
                                filePath = os.path.normpath(os.path.join(localFolder, bsonRef['link']))
                                fileStatus = os.path.isfile(filePath)
                                if fileStatus:
                                    if dryRun:
                                        print("\t\t\tGridFS entry to be deleted: " + bson.filename)
                                    else:
                                        gridfs.GridFS(db, colName).delete(bson._id)
                                        print("\t\t\tGridFS entry deleted: " + bson.filename)
                                else:
                                    print("\t\t\tLinked file not found: " + bson.filename + " -> " + bsonRef["link"])
                            else:
                                print("\t\t\tMissing file link: " + bson.filename)
                        else:
                            print("\t\t\tRef entry not found: " + bson.filename)

##### Drop collection if empty #####
                    if not dryRun and db[colName + ".files"].count() == 0:
                        db[colName + ".files"].drop()
                        db[colName + ".chunks"].drop()
                        print("\t\t\tEmpty collection dropped: " + colName + ".(files|chunks)")
