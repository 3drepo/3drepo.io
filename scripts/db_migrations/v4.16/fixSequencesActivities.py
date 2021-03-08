import sys
from pymongo import MongoClient
import gridfs
import StringIO
import os
import json
import uuid

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

def getFile(db, fsfolder, collection_name, id):
  entry = db[collection_name + ".ref"].find_one({"_id": id})
  if entry == None:
    return None

  if entry.get("type") == "fs":
    fileContent = getFileFs(fsfolder,entry["link"])

    if fileContent:
      return fileContent
    else:
      print ("error fetching file fs for entry" + id)
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


def updateActivitiesSchema(db, modelId, sequenceId):
  activitiesCollName = modelId + ".activities"
  fileContents = getFile(db, fsDirectory, activitiesCollName, str(sequenceId))
  if fileContents:
    activities = json.loads(fileContents)["tasks"]
    updateActivities(db[activitiesCollName], activities, sequenceId)


#### Connect to the Database #####
db = MongoClient(connString)
for database in db.database_names():
    if database != "admin" and database != "local":
        db = MongoClient(connString)[database]
        print("--database:" + database)

##### Get a model ID and find entries #####
        for setting in db.settings.find(no_cursor_timeout=True):
            modelId = setting["_id"]
            print("\t--model: " +  modelId)
            for entry in db[modelId + ".sequences"].find({}):
                entryId = entry["_id"]
                print("\t\t--sequence: " + str(entryId))
                if not dryRun:
                  updateActivitiesSchema(db, modelId, entryId)
