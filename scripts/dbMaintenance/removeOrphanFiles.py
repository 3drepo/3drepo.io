import sys, os
import gridfs
import uuid
from pymongo import MongoClient
import re
import bson
import random
import StringIO
import subprocess

def cleanFileName(fileName):
    fileNameSplit = fileName.split('/')
    nameLength = len(fileNameSplit)
    if "revision" in fileNameSplit:
        return fileNameSplit[nameLength - 2] +"/" +  fileNameSplit[nameLength - 1]
    else:
        return fileNameSplit[nameLength - 1]

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
verbose = False
overwrite = True #if there is already an entry for the filename: True = Overwrite regardless, False = Use existing entry

##### Retrieve file list from local folder #####
tmpFileList = "tmpFileList"
os.system("find " + localFolder + " -type f | sed 's/^" + re.sub('/','\/',localFolder) + "[\/]*//' > " + tmpFileList)
tmpFileListHandle = open(tmpFileList, 'r')
fileList = {}
for filePath in tmpFileListHandle:
    fileList[filePath.rstrip()] = False
tmpFileListHandle.close()

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
                    fileStatus = fileList.get(entry['link'])
                    if fileStatus == None:
                        fileList[entry['link']] = database + "." + modelId + "." + colName
                    else:
                        fileList[entry['link']] = True

for filePath in fileList:
    if isinstance(fileList[filePath], basestring):
        if verbose:
            print("Missing: " + fileList[filePath])
    elif not fileList[filePath]:
        if dryRun:
            print("Orphan: " + filePath)
        else:
            fullFilePath = re.sub('//', '/', localFolder + "/") + filePath
            os.remove(fullFilePath)
            print("--Removed: " + fullFilePath)
