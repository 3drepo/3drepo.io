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
ignoreDirs = ["toy_2019-05-31"]

##### Retrieve file list from local folder #####
fileList = {}

ignoreDirs = [os.path.normpath(os.path.join(localFolder, x)) for x in ignoreDirs]

for (dirPath, dirNames, fileNames) in os.walk(localFolder):
    for fileName in fileNames:
        if not dirPath in ignoreDirs:
            entry = os.path.normpath(os.path.join(dirPath, fileName))
            fileList[entry] = False

##### Connect to the database #####
db = MongoClient(connString)

##### Loop through each database other than admin and local #####
for database in db.database_names():
    if database != "admin" and database != "local" and database != "notifications":
        db = MongoClient(connString)[database]
        print("--database:" + database)

##### Get a model ID #####
        for model in db.settings.find({"federate": {"$ne": True}}, {"_id": 1}):
            modelId = model.get('_id')
            print("\t--model: " + modelId)
            for colPrefix in [".history",".stash.json_mpc", ".stash.unity3d" ]:
                colName = modelId + colPrefix
                print("\t\t---col: " + colName)

##### Check if bson files exist on db and file store before deleting #####
                for bson in gridfs.GridFS(db, colName).find():
                    bsonRef = db[colName + ".ref"].find_one({"_id": bson.filename})
                    if bsonRef and bsonRef["link"]:
                        filePath = os.path.normpath(os.path.join(localFolder, bsonRef['link']))
                        fileStatus = fileList.get(filePath)
                        if fileStatus == None:
                            print("\t\t\tLinked file not found: " + bson.filename + " -> " + bsonRef["link"])
                        else:
                            if dryRun:
                                print("\t\t\tGridFS entry to be deleted: " + bson.filename)
                            else:
                                gridfs.GridFS(db, colName).delete(bson._id)
                                print("\t\t\tGridFS entry deleted: " + bson.filename)

##### Drop collection if empty #####
                if not dryRun and db[colName + ".files"].count() == 0:
                    db[colName + ".files"].drop()
                    db[colName + ".chunks"].drop()
                    print("\t\t\tEmpty collection dropped: " + colName + ".(files|chunks)")
