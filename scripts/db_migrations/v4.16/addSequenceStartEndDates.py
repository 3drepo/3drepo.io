import sys
from pymongo import MongoClient

if len(sys.argv) < 5:
    print("Not enough arguments.")
    print("addSequenceStartEndDates.py <mongoURL> <mongoPort> <userName> <password>")
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
            for entry in db[modelId + ".sequences"].find({"$or":[{"startDate":{"$exists":False}},{"endDate":{"$exists":False}}]}):
                entryId = entry.get("_id")
                print("\t\t--sequence: " +  str(entryId))

                startDate = None
                endDate = None

                frames = entry.get("frames")

                if frames and len(frames) > 0:
                    startDate = frames[0].get("dateTime")
                    endDate = frames[len(frames) - 1].get("dateTime")

                print("\t\t\t--start: " +  str(startDate))
                print("\t\t\t--end: " +  str(endDate))
##### Update entry #####
                if not dryRun:
                    db[modelId + ".risks"].update_one({"_id":entryId},{"$set":{"startDate":startDate, "endDate":endDate}})

