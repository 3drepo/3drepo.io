import sys
from pymongo import MongoClient

if len(sys.argv) < 4:
    print("Not enough arguments.")
    print("migrateTeamspaceSettings.py <mongoURL> <mongoPort> <userName> <password>")
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

        readTopicTypes = False
        topicTypesDict = {}

##### Get a model ID and find entries #####
        for setting in db.settings.find(no_cursor_timeout=True):
            modelId = setting.get('_id')
            print("\t--model: " +  modelId)
            try:
                for modelTopicType in setting['properties']['topicTypes']:
                    topicTypesDict[modelTopicType['label']] = modelTopicType
                readTopicTypes = True
            except KeyError:
                print("\t\ttopicTypes not found in settings")

##### Create Teamspace Settings BSON #####
        if readTopicTypes:
            topicTypes = []
            for types in topicTypesDict:
                topicTypes.append(topicTypesDict[types])

            teamspaceSettings = {}
            teamspaceSettings['_id'] = database
            teamspaceSettings['riskCategories'] = [
                { u'value': u'commercial', u'label': u'Commercial Issue' },
                { u'value': u'environmental', u'label': u'Environmental Issue' },
                { u'value': u'health_material_effect', u'label': u'Health - Material effect' },
                { u'value': u'health_mechanical_effect', u'label': u'Health - Mechanical effect' },
                { u'value': u'safety_fall', u'label': u'Safety Issue - Fall' },
                { u'value': u'safety_trapped', u'label': u'Safety Issue - Trapped' },
                { u'value': u'safety_event', u'label': u'Safety Issue - Event' },
                { u'value': u'safety_handling', u'label': u'Safety Issue - Handling' },
                { u'value': u'safety_struck', u'label': u'Safety Issue - Struck' },
                { u'value': u'safety_public', u'label': u'Safety Issue - Public' },
                { u'value': u'social', u'label': u'Social Issue' },
                { u'value': u'other', u'label': u'Other Issue' },
                { u'value': u'unknown', u'label': u'UNKNOWN' }
            ]
            teamspaceSettings['topicTypes'] = topicTypes

            if not dryRun:
##### Insert Teamspace Settings BSON #####
                db['teamspace'].save(teamspaceSettings)
            else:
                print(teamspaceSettings)
        else:
            print("\t\tNo topicTypes found -- skipping write to settings")
