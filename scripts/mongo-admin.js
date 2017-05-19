db = db.getSiblingDB("admin");

db.dropUser(username);

db.createUser(
        {       user:   "adminUser",
                pwd:    "5199R4PH",
                customData : {
                        firstName:      "Admin",
                        lastName:       "User",
                        email:          "a@b.com",
                        projects:       []
                },
                roles : [
                        { role: "root", db: "admin" }
                ]
        }
);