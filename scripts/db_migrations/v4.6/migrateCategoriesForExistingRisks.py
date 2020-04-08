import sys
from pymongo import MongoClient

if len(sys.argv) < 5:
    print("Not enough arguments.")
    print("migrateCategoriesForExistingRisks.py <mongoURL> <mongoPort> <userName> <password>")
    sys.exit(0)

mongoURL = sys.argv[1]
mongoPort = sys.argv[2]
userName = sys.argv[3]
password = sys.argv[4]

connString = "mongodb://"+ userName + ":" + password +"@"+mongoURL + ":" + mongoPort + "/"

##### Enable dry run to not commit to the database #####
dryRun = True

defaultCategories = {
    "commercial": "Commercial Issue",
    "environmental": "Environmental Issue",
    "health_material_effect": "Health - Material effect",
    "health_mechanical_effect": "Health - Mechanical effect",
    "safety_fall": "Safety Issue - Fall",
    "safety_trapped": "Safety Issue - Trapped",
    "safety_event": "Safety Issue - Event",
    "safety_handling": "Safety Issue - Handling",
    "safety_struck": "Safety Issue - Struck",
    "safety_public": "Safety Issue - Public",
    "social": "Social Issue",
    "other": "Other Issue",
    "unknown": "UNKNOWN"
}

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
            hasOldCategories = db[modelId + ".risks"].find({"category":{"$in":defaultCategories.keys()}})
            if hasOldCategories and len(list(hasOldCategories)) > 0:
                for oldCategory in defaultCategories.keys():
                    if dryRun:
                        matchingRisks = list(db[modelId + ".risks"].find({"category":oldCategory},{"_id":1}))
                        if len(matchingRisks) > 0:
                            print("\t\t\'" + oldCategory + "\' -> \'" + defaultCategories[oldCategory] + "\' for risks: " + ", ".join(map(str, matchingRisks)))
                    else:
                        updateResult = db[modelId + ".risks"].update_many({"category":oldCategory},{"$set":{"category":defaultCategories[oldCategory]}})
                        if updateResult.modified_count > 0:
                            print("\t\t\'" + oldCategory + "\' -> \'" + defaultCategories[oldCategory] + "\'")

