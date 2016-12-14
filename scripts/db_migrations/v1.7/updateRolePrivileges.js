function genViewerRole(db, role, collection){
	return {
	    "privileges" : [ 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" : collection + ".history"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" : collection + ".scene"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" : collection + ".stash.3drepo.chunks"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" : collection + ".stash.3drepo.files"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" : collection + ".stash.3drepo"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" : collection + ".stash.json_mpc.chunks"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" : collection + ".stash.json_mpc.files"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" : collection + ".stash.src.chunks"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" : collection + ".stash.src.files"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" : collection + ".issues"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }
	    ]
	}
}

function genCommenterRole(db, role, collection){
	return {
	    "privileges" : [ 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" :  collection + ".history"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" :  collection + ".scene"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" :  collection + ".stash.3drepo.chunks"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" :  collection + ".stash.3drepo.files"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" :  collection + ".stash.3drepo"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" :  collection + ".stash.json_mpc.chunks"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" :  collection + ".stash.json_mpc.files"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" :  collection + ".stash.src.chunks"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" :  collection + ".stash.src.files"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" :  collection + ".issues"
	            },
	            "actions" : [ 
	                "find", 
	                "insert", 
	                "update"
	            ]
	        }
	    ]
	}
}

function genCollaboratorRole(db, role, collection){
	return {
	    "privileges" : [ 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" : collection + ".history"
	            },
	            "actions" : [ 
	                "find", 
	                "insert"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" : collection + ".scene"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" : collection + ".stash.3drepo.chunks"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" : collection + ".stash.3drepo.files"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" : collection + ".stash.3drepo"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" : collection + ".stash.json_mpc.chunks"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" : collection + ".stash.json_mpc.files"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" : collection + ".stash.src.chunks"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" : collection + ".stash.src.files"
	            },
	            "actions" : [ 
	                "find"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" : collection + ".history.chunks"
	            },
	            "actions" : [ 
	                "find", 
	                "insert"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" : collection + ".history.files"
	            },
	            "actions" : [ 
	                "find", 
	                "insert"
	            ]
	        }, 
	        {
	            "resource" : {
	                "db" : db,
	                "collection" : collection + ".issues"
	            },
	            "actions" : [ 
	                "find", 
	                "insert", 
	                "update"
	            ]
	        }
	    ]
	}
}

var roles = db.getCollection('system.roles').find({})
roles.forEach(function(role){
    if(/^([a-zA-Z0-9_]+)\.(viewer|collaborator|commenter)$/.test(role.role)){
        var keys = role.role.match(/^([a-zA-Z0-9_]+)\.(viewer|collaborator|commenter)$/);
        var type = keys[2];
        var collection = keys[1];
        var roleObj;
        if(type === 'viewer'){
            roleObj = genViewerRole(role.db, role.role, collection);
        } else if (type === 'commenter'){
            roleObj = genCommenterRole(role.db, role.role, collection);
        } else if (type === 'collaborator'){
            roleObj = genCollaboratorRole(role.db, role.role, collection);
        }

        if(roleObj){
        	db.getSiblingDB(role.db).updateRole(role.role, roleObj);
        }
        
    }
});