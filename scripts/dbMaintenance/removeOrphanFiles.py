import sys, os
from pymongo import MongoClient
import re

if len(sys.argv) <= 5:
    print("Not enough arguments.")
    print("removeOrphanFiles.py <mongoURL> <mongoPort> <userName> <password> <localFolder>")
    sys.exit(0)

mongoURL = sys.argv[1]
mongoPort = sys.argv[2]
userName = sys.argv[3]
password = sys.argv[4]
localFolder = sys.argv[5]

if not os.path.exists(localFolder):
    print("LocalFolder " + localFolder + " does not exist.")
    sys.exit(0)

connString = "mongodb://"+ userName + ":" + password +"@"+mongoURL + ":" + mongoPort + "/"

##### Enable dry run to not commit to the database #####
dryRun = False
verbose = True
ignoreDirs = ["toy_2019-05-31"]

##### Retrieve file list from local folder #####
fileList = {}
missing = []

ignoreDirs = [os.path.normpath(os.path.join(localFolder, x)) for x in ignoreDirs]

for (dirPath, dirNames, fileNames) in os.walk(localFolder):
    for fileName in fileNames:
        if not dirPath in ignoreDirs:
            entry = os.path.normpath(os.path.join(dirPath, fileName))
            fileList[entry] = False

##### Connect to the Database #####
db = MongoClient(connString)
for database in db.database_names():
    if database != "admin" and database != "local" and database != "notifications":
        db = MongoClient(connString)[database]
        if verbose:
            print("--database:" + database)

##### Get a model ID and find entries #####
        for setting in db.settings.find(no_cursor_timeout=True):
            modelId = setting.get('_id')
            if verbose:
                print("\t--model: " +  modelId)
            for colPrefix in [".history",".stash.json_mpc", ".stash.unity3d" ]:
                colName = modelId + colPrefix + ".ref"
                if verbose:
                    print("\t\t--stash: " + colName)
                for entry in db[colName].find({"type": "fs"}):
                    filePath = os.path.normpath(os.path.join(localFolder, entry['link']))
                    fileStatus = fileList.get(filePath)
                    if fileStatus == None:
                        missing.append(database + "." + modelId + "." + colName + ":" + entry["_id"] );
                    else:
                        fileList[filePath] = True

##### Identify/delete missing and orphan files #####
print("===== Missing Files =====");
for entry in missing:
    print("\t"+ entry);
print("=========================");
print("===== Orphaned Files =====");
for filePath in fileList:
    if not fileList[filePath]:
        if dryRun:
            print("\t"+ filePath);
        else:
            os.remove(filePath)
            print("\t\t--Removed: " + filePath)
print("==========================");
