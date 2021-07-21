import sys
from pymongo import MongoClient

if len(sys.argv) < 5:
    print("Not enough arguments.")
    print("migrateViews.py <mongoURL> <mongoPort> <userName> <password>")
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
            for view in db[modelId + ".views"].find({"$or":[{"clippingPlanes":{"$exists":True}},{"screenshot":{"$exists":True}}]}):
                viewId = view.get("_id")
                print("\t\t--view: " +  str(viewId))
##### Handle old clipping planes #####
                if "clippingPlanes" in view:
                    if "clippingPlanes" in view.get("viewpoint"):
                        print("\t\t\tclippingPlanes already exists in viewpoint, skipping...")
                    else:
                        view["viewpoint"]["clippingPlanes"] = view.get("clippingPlanes")
##### Handle old screenshot #####
                if "screenshot" in view and "buffer" in view.get("screenshot"):
                    if "thumbnail" in view:
                        print("\t\t\tthumbnail already exists in view, skipping...")
                    else:
                        screenshot = view.get("screenshot")
                        view["thumbnail"] = screenshot.get("buffer")

                if not dryRun:
                    db[modelId + ".views"].update_one({"_id":viewId},{"$set":view})

