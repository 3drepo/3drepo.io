import sys, os
import gridfs
import uuid
from pymongo import MongoClient
import re
import bson
import StringIO

def cleanFileName(fileName):
    fileNameSplit = fileName.split('/')
    nameLength = len(fileNameSplit)
    if "revision" in fileNameSplit:
        return fileNameSplit[nameLength - 2] +"/" +  fileNameSplit[nameLength - 1]
    else:
        return fileNameSplit[nameLength - 1]


if len(sys.argv) < 4:
    print("Not enough arguments.")
    print("moveModelsToFS.py <mongoURL> <mongoPort> <userName> <password>")
    sys.exit(0)

mongoURL = sys.argv[1]
mongoPort = sys.argv[2]
userName = sys.argv[3]
password = sys.argv[4]

connString = "mongodb://"+ userName + ":" + password +"@"+mongoURL + ":" + mongoPort + "/"

##### Enable dry run to not commit to the database #####
dryRun = True

##### Connect to the Database #####
db = MongoClient(connString)
for database in db.database_names():
    if database != "admin" and database != "local":
        db = MongoClient(connString)[database]
        print("--database:" + database)

##### Get a model ID and find entries #####
        for setting in db.settings.find(no_cursor_timeout=True):
            modelId = setting.get('_id')
            print("\t--model: " +  modelId)
            for colPrefix in [".history",".stash.json_mpc", ".stash.unity3d" ]:
                colName = modelId + colPrefix
                print("\t\t--stash: " +  colName)
                fs = gridfs.GridFS(db, colName)
                for entry in fs.find({"filename":{"$not": re.compile("unityAssets.json$")}}):
##### Create Reference BSON #####
                    filename = cleanFileName(entry.filename)
                    bsonData = {}
                    bsonData['_id'] = filename
                    bsonData['link'] = filename
                    bsonData['type'] = "gridfs"
                    bsonData['size'] = entry.length

                    if dryRun:
                        print( "\t\t Writing: " + str(bsonData))
                    else:
##### Upload to FS and insert BSON #####
                        fs.put(entry.read(), filename=filename);
                        targetCol = colName + ".ref"
                        db[targetCol].save(bsonData)
