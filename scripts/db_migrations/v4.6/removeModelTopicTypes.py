import sys
from pymongo import MongoClient

if len(sys.argv) < 4:
    print("Not enough arguments.")
    print("removeModelTopicTypes.py <mongoURL> <mongoPort> <userName> <password>")
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
            modelId = setting.get('_id')
            print("\t--model: " +  modelId)
            try:
##### Delete Topic Types from Model Settings #####
                del setting['properties']['topicTypes']
                if not dryRun:
                    db['settings'].save(setting)
            except KeyError:
                print("\t\ttopicTypes not found in settings")
