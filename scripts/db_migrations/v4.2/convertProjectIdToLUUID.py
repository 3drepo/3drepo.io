import sys
import uuid
from pprint import pprint
from pymongo import MongoClient

if len(sys.argv) <= 4:
    print("Not enough arguments.")
    print("convertProjectToLUUID.py <mongoURL> <mongoPort> <userName> <password>")
    sys.exit(0)

mongoURL, mongoPort, userName, password = sys.argv[1:5] # pylint: disable=unbalanced-tuple-unpacking
connString = "mongodb://"+ userName + ":" + password +"@"+mongoURL + ":" + mongoPort + "/"

db = MongoClient(connString)

def migrateProject(projects, project):
    _id = project["_id"]
    if len(str(_id)) < 32:
        project["_id"] = uuid.UUID(str(_id).ljust(32,'0'))
        projects.insert_one(project)
        projects.delete_one({'_id': _id})

def migrateDbProjects(database):
    print("Migrating... " + database)
    db = MongoClient(connString)[database]
    for project in db.projects.find():
        migrateProject(db.projects, project)


for database in db.database_names():
    if database == "admin" or database == "local" or database == "notifications":
        continue
    migrateDbProjects(database)
