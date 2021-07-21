import sys
from pymongo import MongoClient

if len(sys.argv) < 5:
    print("Not enough arguments.")
    print("migrateOrthogonal.py <mongoURL> <mongoPort> <userName> <password>")
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
            for coll in ["issues","risks","views"]:
                for entry in db[modelId + "." + coll].find({"$or":[{"viewpoint.type":"orthogonal"},{"viewpoints.type":"orthogonal"}]}):
                    entryId = entry.get("_id")
                    print("\t\t--" + coll +": " +  str(entryId))
##### Handle viewpoint #####
                    if "viewpoint" in entry:
                        if entry["viewpoint"]["type"] == "orthogonal":
                            entry["viewpoint"]["type"] = "orthographic"
##### Handle viewpoints #####
                    if "viewpoints" in entry:
                        for idx, vp in enumerate(entry.get("viewpoints")):
                            if entry["viewpoints"][idx]["type"] == "orthogonal":
                                entry["viewpoints"][idx]["type"] = "orthographic"

                    if not dryRun:
                        db[modelId + "." + coll].update_one({"_id":entryId},{"$set":entry})

