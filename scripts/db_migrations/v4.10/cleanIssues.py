import sys
from pymongo import MongoClient

if len(sys.argv) < 5:
    print("Not enough arguments.")
    print("cleanIssues.py <mongoURL> <mongoPort> <userName> <password>")
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
            for issue in db[modelId + ".issues"].find({"$or":[{"comments._id":{"$exists":True}},{"viewpoints._id":{"$exists":True}},{"viewpoint":{"$exists":True}}]}):
                issueId = issue.get("_id")
                unsetFields = { "$unset": {} }
                print("\t\t--issue: " +  str(issueId))
##### Remove legacy viewpoint #####
                if "viewpoint" in issue:
                    if len(issue["viewpoint"]["up"]) == 0:
                        unsetFields["$unset"]["viewpoint"] = ""
                        print("\t\t\tremove legacy viewpoint")
##### Handle comments and viewpoints IDs #####
                for field in ["comments", "viewpoints"]:
                    if field in issue:
                        if issue.get(field):
                            for idx, entry in enumerate(issue.get(field)):
                                if "_id" in entry:
                                    unsetFields["$unset"][field + "." + str(idx) + "._id"] = ""
                                    print("\t\t\tremove unexpected " + field + " _id")

                if not dryRun and any(unsetFields.get("$unset")):
                    db[modelId + ".issues"].update_one({"_id":issueId}, unsetFields)

