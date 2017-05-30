db = db.getSiblingDB("admin");
db.dropRole("nodeUserRole");
// Create Node user and assigns to him the
// created nodeUser role
db.createRole({
    "role": "nodeUserRole",
    "privileges": [{
            "resource": {
                "db": "admin",
                "collection": "system.users"
            },
            "actions": [
                "find",
                "update"
            ]
        },
        {
            "resource": {
                "db": "admin",
                "collection": "system.roles"
            },
            "actions": [
                "find"
            ]
        },
        {
            "resource": {
                "db": "admin",
                "collection": ""
            },
            "actions": [
                "changeCustomData",
                "changePassword",
                "createUser"
            ]
        },
        {
            "resource": {
                "db": "",
                "collection": ""
            },
            "actions": [
                "viewRole",
                "grantRole",
                "createRole",
                "revokeRole"
            ]
        }
    ],
    roles: [{
        role: "readWriteAnyDatabase",
        db: "admin"
    }]
});
db.dropUser(username);
db.createUser({
    user: username,
    pwd: password,
    customData: {
        firstName: "Node",
        lastName: "User",
        email: "a@b.com",
        projects: []
    },
    roles: [{
        role: "nodeUserRole",
        db: "admin"
    }]
});