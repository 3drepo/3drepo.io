import sys
from pymongo import MongoClient
from findModelFaceCount import getCount
from findModelFaceCount import printMeshCount

if len(sys.argv) < 7:
    print("Not enough arguments.")
    print("findFederationFaceCount.py <mongoURL> <mongoPort> <userName> <password> <db> <federation>")
    sys.exit(0)

mongoURL = sys.argv[1]
mongoPort = sys.argv[2]
userName = sys.argv[3]
password = sys.argv[4]
database = sys.argv[5]
fedId = sys.argv[6]

connString = "mongodb://"+ userName + ":" + password +"@"+mongoURL + ":" + mongoPort + "/"

debug = False
showSum = False

##### Connect to the Database #####
db = MongoClient(connString)
if database in db.database_names():
    db = MongoClient(connString)[database]
    if debug:
        print("--database: " + database)

##### Check federation ID and find submodel face counts #####
    if 0 < len(list(db.settings.find({"_id":fedId}))):
        facesCount = 0
        if debug:
            print("\t--federation: " +  fedId)
        for entry in db[fedId + ".scene"].find({"type":"ref"}):
            modelId = entry.get("project")
            if showSum:
                modelFacesCount = getCount(connString, database, modelId, debug)
                if modelFacesCount != None:
                    facesCount = facesCount + modelFacesCount
            else:
                printMeshCount(connString, database, modelId, debug)
            if debug:
                print("\t\t--model: " + modelId)
                print("\t\t\t--faces_count: " + str(modelFacesCount))
            else:
                if showSum:
                    print(modelId + ": " + str(modelFacesCount))
        if debug:
            print("\t\t--faces_count: " + str(facesCount))
        else:
            if showSum:
                print("federation face count: " + str(facesCount))
    else:
        if debug:
            print("\t-federation not found: " + fedId)
        else:
            print(0)

else:
    if debug:
        print("--database not found: " + database)
    else:
        print(0)
