import sys
from pymongo import MongoClient
import pymongo

if len(sys.argv) < 5:
    print("Not enough arguments.")
    print("addRiskNumbers.py <mongoURL> <mongoPort> <userName> <password>")
    sys.exit(0)

mongoURL = sys.argv[1]
mongoPort = sys.argv[2]
userName = sys.argv[3]
password = sys.argv[4]

connString = "mongodb://"+ userName + ":" + password +"@"+mongoURL + ":" + mongoPort + "/"

##### Enable dry run to not commit to the database #####
dryRun = True

##### Connect to the Database #####
db = MongoClient(connString)
for database in db.database_names():
    if database != "admin" and database != "local":
        db = MongoClient(connString)[database]
        print("--database:" + database)

##### Get a model ID and find entries #####
        for setting in db.settings.find(no_cursor_timeout=True):
            modelId = setting.get("_id")
            print("\t--model: " +  modelId)
            riskNumber = 1
            db[modelId + ".risks"].ensure_index([("created", pymongo.ASCENDING)])
            for risk in db[modelId + ".risks"].find(no_cursor_timeout=True).sort("created", pymongo.ASCENDING):
                riskId = risk.get("_id")
                print("\t\t--risk (" + str(riskNumber) +"): " +  str(riskId))
                if not dryRun:
                    db[modelId + ".risks"].update_one({"_id":riskId}, {"$set":{"number":riskNumber}})
                riskNumber += 1

