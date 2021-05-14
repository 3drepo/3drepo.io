# Copyright 2021 Santiago Montero
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
import sys
from pymongo import MongoClient
import gridfs
import StringIO
import os
import json
import uuid
import datetime
import time

####### test files functions
def getFileGridFS(db, collection_name, link):
  fs = gridfs.GridFS(db, collection_name)
  entry = fs.find_one({ "filename": link })
  if entry:
    return entry.read()
  return None

def getFileFs(fsfolder, link):
  filename = os.path.join(fsfolder, link)

  if not os.path.isfile(filename):
    return None

  f = open(filename, "r")
  return f.read()

def getRef(db, collection_name, id):
  return db[collection_name + ".ref"].find_one({"_id": id})


def getFile(db, fsfolder, collection_name, id):
  entry = getRef(db, collection_name, id)

  if entry == None:
    return None

  if entry["type"] == "fs":
    fileContent = getFileFs(fsfolder,entry["link"])

    if fileContent:
      return fileContent
    else:
      return getFileGridFS(db, collection_name, id)

  return getFileGridFS(db, collection_name,entry["link"])

def testActivitiesFile(db, modelId, sequenceId):
  activitiesCollName = modelId + ".activities"
  ref = getRef(db, activitiesCollName, str(sequenceId))
  if not ref:
    print("Warning: file reference for sequence " + str(sequenceId) + " was not found")
    return
  else:
    print("File reference for sequence " + str(sequenceId) + " was found. Ref type:" + ref["type"] + ", link:" + (ref["link"]))

  fileContents = getFile(db, fsDirectory, activitiesCollName, str(sequenceId))
  if fileContents:
    print ("File for sequence " + str(sequenceId) + " was found")
  else:
    print ("Warning: File for sequence " + str(sequenceId) + " was NOT found")

####### /Test files functions


####### Remove file functions
def removeFileFs(fsfolder, link):
  filename = os.path.join(fsfolder, link)

  if not os.path.isfile(filename):
    return False

  os.remove(filename)
  return True

def removeFileGridFs(db, collection_name, link):
  fs = gridfs.GridFS(db, collection_name)
  gridfsfile =  fs.find_one({ "filename": link })

  if gridfsfile:
    fs.delete(gridfsfile._id)

def removeFile(db, fsfolder, collection_name, id):
  entry = db[collection_name + ".ref"].find_one({"_id": id})

  if entry:
    if entry["type"] == "fs":
      if removeFileFs(fsfolder, entry["link"]):
        print("File succesfully removed from filesystem" + entry["link"])
      else:
        print("File unsuccesfully removed from filesystem" + entry["link"])

    removeFileGridFs(db, collection_name, entry["link"])
  else:
    print ("Fileref not found " + id)

  db[collection_name + ".ref"].delete_one({"_id": id})

####### /Remove file functions


if len(sys.argv) < 6:
    print("Not enough arguments.")
    print("python " + os.path.basename(__file__) + " <mongoURL> <mongoPort> <userName> <password> <fsDirectory> [<dryRun>]")
    print("<dryRun> is true by default")
    sys.exit(0)

mongoURL = sys.argv[1]
mongoPort = sys.argv[2]
userName = sys.argv[3]
password = sys.argv[4]
fsDirectory = sys.argv[5]
dryRun = True if len(sys.argv) < 7 else sys.argv[6] != "false"

if not dryRun:
  print("dryRun = False: Commiting to database")
else:
  print("dryRun = True: Trial run")

connString = "mongodb://"+ userName + ":" + password +"@"+mongoURL + ":" + mongoPort + "/"

#### Connect to the Database #####
db = MongoClient(connString)

for database in db.database_names():
    if database != "admin" and database != "local":
        db = MongoClient(connString)[database]
        print("--database:" + database)

##### Get a model ID and find entries #####
        for setting in db.settings.find(no_cursor_timeout=True):
            modelId = str(setting["_id"])
            print("\t--model: " +  modelId)
            for entry in db[modelId + ".sequences"].find({"customSequence": {"$ne": True}}):
                entryId = entry["_id"]
                print("\t\t--sequence: " + str(entryId))
                sequencefullname = str(database) + "/" +str(modelId) + "/" + str(entryId)

                if not dryRun:
                  removeFile(db, fsDirectory , modelId + ".activities",  str(entryId))
                else:
                  testActivitiesFile(db, modelId, entryId)

