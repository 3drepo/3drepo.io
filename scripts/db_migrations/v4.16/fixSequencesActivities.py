import sys
from pymongo import MongoClient
import gridfs
import StringIO
import os
import json
import uuid
import datetime
import time

def strToTimestamp(date_time_str):
  date_time_obj = datetime.datetime.strptime(date_time_str, '%d %b %Y %H:%M:%S')
  return int(time.mktime(date_time_obj.timetuple()))*1000

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


def migrateData(data):
  migratedData = []

  for key in data:
    migratedData.append({ "key": key, "value": data[key]})

  return migratedData

def updateActivities(coll, activities, sequenceId, parent = None):
  for activity in activities:
    updateProps =  {"$set": {"sequenceId": sequenceId, "startDate": activity["startDate"], "endDate": activity["endDate"] }, "$unset": {"parents": ""}}

    if parent:
      updateProps["$set"]["parent"] = uuid.UUID(parent)

    query = {"_id": uuid.UUID(activity["id"])}

    currentActivity = coll.find_one(query, {"resources": 1, "data":1})
    if "resources" in currentActivity and type(currentActivity["resources"]) is list:
      updateProps["$set"]["resources"] = { "shared_id": currentActivity["resources"] }

    if "data" in currentActivity and type(currentActivity["data"]) is dict:
      updateProps["$set"]["data"] = migrateData(currentActivity["data"])

    coll.update_one(query, updateProps)

    if "subTasks" in activity:
      updateActivities(coll, activity["subTasks"], sequenceId, activity["id"])


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

def wasMigrated(db, modelId, sequenceId):
  activitiesCollName = modelId + ".activities"
  results = db[activitiesCollName].find_one({"sequenceId": sequenceId})
  return results != None

def hasActivitiesCollection(db, modelId):
  activitiesCollName =  modelId + ".activities"
  results = db[activitiesCollName].find()
  return results != None and results.count() > 0

def hasTasksCollection(db, modelId):
  tasksCollName =  modelId + ".tasks"
  results = db[tasksCollName].find()
  return results != None and results.count() > 0

def testActivitiesFile(db, modelId, sequenceId):
  activitiesCollName = modelId + ".activities"
  ref = getRef(db, activitiesCollName, id)
  if not ref:
    print("Warning: file reference for sequence " + str(sequenceId) + " was not found")
    return
  else:
    print("File reference for sequence " + str(sequenceId) + " was found. Ref type:" + ref["type"] + ", link:" + entry["link"])

  fileContents = getFile(db, fsDirectory, activitiesCollName, str(sequenceId))
  if fileContents:
    print ("File for sequence " + str(sequenceId) + " was found")
  else:
    print ("Warning: File for sequence " + str(sequenceId) + " was NOT found")

def updateActivitiesSchema(db, modelId, sequenceId):
  activitiesCollName = modelId + ".activities"
  fileContents = getFile(db, fsDirectory, activitiesCollName, str(sequenceId))
  if fileContents:
    activities = json.loads(fileContents)["tasks"]
    updateActivities(db[activitiesCollName], activities, sequenceId)
  else:
    print ("error fetching file fs for sequence: " + str(sequenceId))


def insertActivityFromTask(db, modelId, sequenceId, task): # sequenceId is expected to uuid.UUID
  activitiesCollName = modelId + ".activities"
  activity = None

  if db[activitiesCollName]:
    activity = db[activitiesCollName].find_one({"_id": task["_id"]})

  if activity == None:
    if "data" in task and "Planned Start" in task["data"] and "Planned Finish" in task["data"] :
      activity = {"_id": task["_id"], "name": task["name"], "sequenceId": sequenceId}
      activity["startDate"] = strToTimestamp(task["data"]["Planned Start"])
      activity["endDate"] = strToTimestamp(task["data"]["Planned Finish"])
      activity["data"] = migrateData(task["data"])
      if "parents" in task and len(task["parents"]) > 0:
        activity["parent"] = task["parents"][0]

      db[activitiesCollName].insert_one(activity)

def migrateTasksCollection(db, modelId, sequenceId):
  tasksCollName =  modelId + ".tasks"
  tasks = db[tasksCollName].find({})
  for task in tasks:
    insertActivityFromTask(db, modelId, sequenceId, task)

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
            for entry in db[modelId + ".sequences"].find({}):
                entryId = entry["_id"]
                print("\t\t--sequence: " + str(entryId))

                if not dryRun:
                  if hasTasksCollection(db, modelId) and not hasActivitiesCollection(db, modelId):
                    print("\t\t\t--Migrating sequence: " + str(entryId) + " from tasks")
                    migrateTasksCollection(db, modelId, entryId)
                    db[modelId + ".tasks"].drop()
                  else:
                      if not wasMigrated(db, modelId, entryId):
                        updateActivitiesSchema(db, modelId, entryId)
                      else:
                        print("\t\t\t--Skipping sequence: " + str(entryId) + ", sequence already migrated")
                else:
                  if hasTasksCollection(db, modelId) and not hasActivitiesCollection(db, modelId):
                    print("\t\t\t--Sequence: " + str(entryId) + " has old tasks schema (tasks collection)")
                  else:
                    testActivitiesFile(db, modelId, entryId)
                  if wasMigrated(db, modelId, entryId):
                    print("\t\t\t--Sequence: " + str(entryId) + " already migrated")


