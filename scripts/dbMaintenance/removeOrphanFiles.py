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

localFolder = re.sub("//", "/", localFolder + "/")

if not os.path.exists(localFolder):
    print("LocalFolder " + localFolder + " does not exist.")
    sys.exit(0)

connString = "mongodb://"+ userName + ":" + password +"@"+mongoURL + ":" + mongoPort + "/"

##### Enable dry run to not commit to the database #####
dryRun = True
verbose = True
ignoreDirs = ["toy_2019-05-31"]

##### Retrieve file list from local folder #####
fileList = {}

ignoreDirs = [localFolder + x for x in ignoreDirs]
ignoreDirsFilter = "^(" + "|".join(ignoreDirs) + ")"

for (dirPath, dirNames, fileNames) in os.walk(localFolder):
    for fileName in fileNames:
        if not re.search(ignoreDirsFilter, dirPath):
            fileList[re.sub("//", "/", dirPath + "/" + fileName)] = False

##### Connect to the Database #####
db = MongoClient(connString)
for database in db.database_names():
    if database != "admin" and database != "local":
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
                for entry in db[colName].find():
                    fileStatus = fileList.get(localFolder + entry['link'])
                    if fileStatus == None:
                        fileList[entry['link']] = database + "." + modelId + "." + colName
                    else:
                        fileList[entry['link']] = True

##### Identify/delete missing and orphan files #####
for filePath in fileList:
    if isinstance(fileList[filePath], basestring):
        if verbose:
            print("Missing: " + fileList[filePath])
    elif not fileList[filePath]:
        if dryRun:
            print("Orphan: " + filePath)
        else:
            os.remove(filePath)
            print("--Removed: " + filePath)
