import sys, os
import gridfs
import uuid
from pymongo import MongoClient
import re
import bson
import random
import StringIO

def cleanFileName(fileName):
    fileNameSplit = fileName.split('/')
    nameLength = len(fileNameSplit)
    if "revision" in fileNameSplit:
        return fileNameSplit[nameLength - 2] +"/" +  fileNameSplit[nameLength - 1]
    else:
        return fileNameSplit[nameLength - 1]

def genFileDir(fileName, dirLevels):
    directory = ''
    minChunkLen = 4
    nameChunkLen = len(fileName) / dirLevels
    if nameChunkLen < minChunkLen:
        nameChunkLen = minChunkLen
    for i in range(dirLevels):
        chunkStart = (i * nameChunkLen) % len(fileName)
        fileNameHash = hash(fileName[chunkStart : chunkStart + nameChunkLen] + str(random.random()))
        directory += str(fileNameHash & 255) + '/'
    return directory

if len(sys.argv) < 4:
    print("Not enough arguments.")
    print("moveModelsToFS.py <mongoURL> <mongoPort> <userName> <password> <localFolder>")
    sys.exit(0)

mongoURL = sys.argv[1]
mongoPort = sys.argv[2]
userName = sys.argv[3]
password = sys.argv[4]
localFolder = sys.argv[5]

compression = None

if len(sys.argv) > 6:
    compression = sys.argv[6]

if not os.path.exists(localFolder):
    print("LocalFolder " + localFolder + " does not exist.")
    sys.exit(0)

connString = "mongodb://"+ userName + ":" + password +"@"+mongoURL + ":" + mongoPort + "/"

##### Enable dry run to not commit to the database #####
dryRun = True

##### Number of directory levels to use #####
dirLevels = 2

##### Connect to the Database #####
db = MongoClient(connString)
for database in db.database_names():
    if database != "admin" and database != "local":
        db = MongoClient(connString)[database]
        print("--database:" + database)

##### Get a model ID and find entries #####
        for setting in db.settings.find():
            modelId = setting.get('_id')
            print("\t--model: " +  modelId)
            for colPrefix in [".history",".stash.json_mpc", ".stash.unity3d" ]:
                colName = modelId + colPrefix
                print("\t\t--stash: " +  colName)
                fs = gridfs.GridFS(db, colName)
                for entry in fs.find({"filename":{"$not": re.compile("unityAssets.json$")}}):
                    fileId = str(uuid.uuid4())
                    directory = genFileDir(fileId, dirLevels)
                    fileLink = directory + fileId
                    filePath = localFolder + '/' + fileLink
##### Create Reference BSON #####
                    bsonData = {}
                    bsonData['_id'] = cleanFileName(entry.filename)
                    bsonData['link'] = fileLink
                    bsonData['type'] = "fs"
                    bsonData['size'] = entry.length
                    if compression:
                        bsonData['compression'] = compression # snappy / none

                    if dryRun:
                        print( "\t\t Writing: " + str(bsonData))
                        print("\t\t Path:" + str(filePath))
                    else:
##### Upload to FS and insert BSON #####
                        if not os.path.exists(os.path.dirname(filePath)):
                            os.makedirs(os.path.dirname(filePath))
                        file = open(filePath,'wb')
                        file.write(StringIO.StringIO(entry.read()).getvalue())
                        file.close()
                        targetCol = colName + ".ref"
                        db[targetCol].save(bsonData)
