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
        regex = re.compile(".+\.ref$");
        for colName in db.collection_names():
            result = regex.match(colName);
            if result:
                if verbose:
                    print("\t--collection:" + colName);
                for refEntry in db[colName].find({"type": "fs"}):
                    filePath = os.path.normpath(os.path.join(localFolder, refEntry['link']))
                    inIgnoreDir= bool([ x for x in ignoreDirs if filePath.find(x) + 1 ])
                    if not inIgnoreDir:
                        fileStatus = fileList.get(filePath)
                        if fileStatus == None:
                            refInfo = database + "." + colName + ": " + refEntry["_id"]
                            if dryRun:
                                missing.append(refInfo);
                            else:
    ##### Upload missing files to FS and insert BSON #####
                                parentCol = colName[:-4];
                                fs = gridfs.GridFS(db, parentCol)
                                if ".stash.json_mpc" in parentCol or "stash.unity3d" in parentCol:
                                    modelId = parentCol.split(".")[0];
                                    if len(refEntry["_id"].split("/")) > 1:
                                        toRepair = "/" + database + "/" + modelId + "/revision/" + refEntry["_id"]
                                    else:
                                        toRepair = "/" + database + "/" + modelId + "/" + refEntry["_id"]
                                else:
                                    toRepair = refEntry["_id"]
                                gridFSEntry = fs.find_one({"filename": toRepair})
                                if gridFSEntry != None:
                                    if not os.path.exists(os.path.dirname(filePath)):
                                        os.makedirs(os.path.dirname(filePath))
                                    file = open(filePath,'wb')
                                    if isPython3:
                                        file.write(BytesIO(gridFSEntry.read()).getvalue())
                                    else:
                                        file.write(StringIO(gridFSEntry.read()).getvalue())
                                    file.close()
                                    missing.append(refInfo + " (Restored to: " + filePath + ")");
                                else:
                                    missing.append(refInfo + ": No backup found. Reference removed.");
                                    db[colName].remove({"_id": refEntry["_id"]});
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
