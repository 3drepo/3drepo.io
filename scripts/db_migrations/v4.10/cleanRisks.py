import sys
from pymongo import MongoClient

if len(sys.argv) < 5:
    print("Not enough arguments.")
    print("cleanRisks.py <mongoURL> <mongoPort> <userName> <password>")
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
            for risk in db[modelId + ".risks"].find({"$or":[{"viewpoints.highlighted_group_id":""},{"viewpoints.hidden_group_id":""},{"viewpoints.shown_group_id":""}]}):
                riskId = risk.get("_id")
                unsetFields = { "$unset": {} }
                print("\t\t--risk: " +  str(riskId))
##### Handle empty group IDs #####
                for field in ["highlighted_group_id", "hidden_group_id", "shown_group_id"]:
                    for idx, entry in enumerate(risk.get("viewpoints")):
                        if "" == entry.get(field):
                            unsetFields["$unset"]["viewpoints." + str(idx) + "." + field] = ""
                            print("\t\t\tremove empty " + field)

                if not dryRun and any(unsetFields.get("$unset")):
                    db[modelId + ".risks"].update_one({"_id":riskId}, unsetFields)

