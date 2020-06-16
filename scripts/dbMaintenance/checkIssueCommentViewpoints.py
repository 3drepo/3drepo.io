import sys
from pymongo import MongoClient

if len(sys.argv) < 5:
    print("Not enough arguments.")
    print("checkIssueCommentViewpoints.py <mongoURL> <mongoPort> <userName> <password>")
    sys.exit(0)

mongoURL = sys.argv[1]
mongoPort = sys.argv[2]
userName = sys.argv[3]
password = sys.argv[4]

connString = "mongodb://"+ userName + ":" + password +"@"+mongoURL + ":" + mongoPort + "/"

badIssues = {}

##### Connect to the Database #####
db = MongoClient(connString)
for database in db.database_names():
    if database != "admin" and database != "local":
        db = MongoClient(connString)[database]
        print("--database:" + database)

        badRecordsCount = 0

##### Get a model ID and find entries #####
        for setting in db.settings.find(no_cursor_timeout=True):
            modelId = setting.get("_id")
            print("\t--model: " +  modelId)
            issuesWithBadComments = list(db[modelId + ".issues"].find({"comments.viewpoint.guid":{"$exists":True}}))
            badRecordsCount += len(issuesWithBadComments)
        if badRecordsCount > 0:
            badIssues[database] = badRecordsCount

print("")
print("============ CHECK ISSUE COMMENT VIEWPOINTS RESULT ============")

if bool(badIssues):
    for database in badIssues:
        print(database + " has " + str(badIssues[database]) + " bad issues")
else:
    print("No bad records found")
