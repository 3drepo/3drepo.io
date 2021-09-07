import sys
from pymongo import MongoClient

if len(sys.argv) < 7:
    print("Not enough arguments.")
    print("findModelFaceCount.py <mongoURL> <mongoPort> <userName> <password> <db> <model>")
    sys.exit(0)

mongoURL = sys.argv[1]
mongoPort = sys.argv[2]
userName = sys.argv[3]
password = sys.argv[4]
database = sys.argv[5]
modelId = sys.argv[6]

connString = "mongodb://"+ userName + ":" + password +"@"+mongoURL + ":" + mongoPort + "/"

debug = False

def getCount(connString, database, modelId, debug):
    ##### Connect to the Database #####
    db = MongoClient(connString)
    if database in db.database_names():
        db = MongoClient(connString)[database]
        if debug:
            print("--database: " + database)

    ##### Check model ID and sum face count #####
        if 0 < len(list(db.settings.find({"_id":modelId}))):
            if debug:
                print("\t--model: " +  modelId)
            for entry in db[modelId + ".scene"].aggregate([{"$group":{"_id":None,"faces_count":{"$sum":1}}}]):
                facesCount = entry.get("faces_count")
                if debug:
                    print("\t\t--faces_count: " + str(facesCount))
                else:
                    return facesCount
        else:
            if debug:
                print("\t-model not found: " + modelId)
            else:
                return 0

    else:
        if debug:
            print("--database not found: " + database)
        else:
            return 0

def printMeshCount(connString, database, modelId, debug):
    ##### Connect to the Database #####
    db = MongoClient(connString)
    if database in db.database_names():
        db = MongoClient(connString)[database]
        if debug:
            print("--database: " + database)

    ##### Check model ID and sum face count #####
        if 0 < len(list(db.settings.find({"_id":modelId}))):
            if debug:
                print("\t--model: " +  modelId)
            for entry in db[modelId + ".scene"].find({"type":"mesh"}):
                sharedId = entry.get("shared_id")
                facesCount = entry.get("faces_count")
                print(modelId + ", " + str(sharedId) + ", " + str(facesCount))
        else:
            if debug:
                print("\t-model not found: " + modelId)

    else:
        if debug:
            print("--database not found: " + database)

modelFaceCount = getCount(connString, database, modelId, debug)
if not debug:
    print(modelFaceCount)
