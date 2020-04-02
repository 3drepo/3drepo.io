import sys, os

from pymongo import MongoClient
import gridfs
import re

isPython3 = bool(sys.version_info >= (3, 0))
if isPython3:
    from io import BytesIO
else:
    from StringIO import StringIO

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
dryRun = True
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
                for refEntry in db[colName].find({"type": "fs"}):
                    filePath = os.path.normpath(os.path.join(localFolder, refEntry['link']))
                    inIgnoreDir= bool([ x for x in ignoreDirs if filePath.find(x) + 1 ])
                    if not inIgnoreDir:
                        fileStatus = fileList.get(filePath)
                        if fileStatus == None:
                            refInfo = database + "." + modelId + "." + colName + ": " + refEntry["_id"]
                            if dryRun:
                                missing.append(refInfo);
                            else:
    ##### Upload missing files to FS and insert BSON #####
                                fs = gridfs.GridFS(db, modelId + colPrefix)
                                if colPrefix == ".history":
                                    toRepair = refEntry["_id"]
                                else:
                                    if len(refEntry["_id"].split("/")) > 1:
                                        toRepair = "/" + database + "/" + modelId + "/revision/" + refEntry["_id"]
                                    else:
                                        toRepair = "/" + database + "/" + modelId + "/" + refEntry["_id"]
                                gridFSEntry = fs.find_one({"filename": toRepair})
                                if gridFSEntry != None:
                                    if not os.path.exists(os.path.dirname(filePath)):
                                        os.makedirs(os.path.dirname(filePath))
                                    file = open(filePath,'wb')
                                    if isPython3:
                                        file.write(BytesIO(gridFSEntry.read()).getvalue())
                                    else:
                                        file.write(StringIO.StringIO(gridFSEntry.read()).getvalue())
                                    file.close()
                                    missing.append(refInfo + " (Restored to: " + filePath + ")");
                                else:
                                    missing.append(refInfo + ": No backup found.");
                        else:
                            fileList[filePath] = True

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
##### Delete orphan files #####
            os.remove(filePath)
            print("\t\t--Removed: " + filePath)
print("==========================");
