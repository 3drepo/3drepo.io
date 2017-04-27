use admin
// add basic licence if dun have one
print('init: create basic licence for everyone if they do not have one');
db.system.users.update({ 'customData.billing.subscriptions.plan': {'$ne':'BASIC'}}, { 
    '$push': {
        'customData.billing.subscriptions': {
                    "plan" : "BASIC",
                    "createdAt" : ISODate(),
                    "updatedAt" : ISODate(),
                    "active" : true,
                    "expiredAt" : null,
                    "_id" : ObjectId(),
                    "limits" : {
                        "spaceLimit" : 209715200,
                        "collaboratorLimit" : 0
                    },
                    "permissions" : []
                }
     }
    
}, {multi: true});

var permissionTemplates = [
    {
        _id: 'viewer',
        permissions: ['view_issue','view_model']
    },
    {
        _id: 'commenter',
        permissions: ['create_issue','comment_issue','view_issue','view_model']
    },
    {
        _id: 'collaborator',
        permissions: ['upload_files','create_issue','comment_issue','view_issue','view_model','download_model','edit_federation']
    },
];

print('init: create default permission templates(viwer, commenter, collaborator) for everyone');
// generate default permission templates 
db.system.users.update({}, { '$addToSet': {
        'customData.permissionTemplates': { '$each': permissionTemplates }
    } 
}, { multi: true});

function groupByDB(items){
    var obj = {};
    items.forEach(function(item){
        if(obj[item.db]){
            obj[item.db].push(item);
        } else {
            obj[item.db] = [item]
        }
    });
    return obj;
}

var users = db.system.users.find();
while(users.hasNext()){
    
    var user = users.next();
    
    print('processing user [' + user.user + ']');
    
    var rolesByDB = groupByDB(user.roles);
    for(database in rolesByDB){

        print ('migrating database [' + database + '] permissions on [' + user.user + ']' );

        if(database === 'admin'){
            continue;
        }
        
        var roles = rolesByDB[database];
        var findRoleWithAdmin = roles.find(function(role){
            return role.role === 'admin' || role.role === 'readWrite';
        });
        
        if(findRoleWithAdmin){

            print('admin role found in this database therefore ignoring all other permissions (as they are redundant)');

            var count = db.system.users.count({
                'user': findRoleWithAdmin.db,
                'customData.permissions.user': user.user
            });

            if(count === 0){
 
                print('creating teamsapce admin permission');

                db.system.users.update({
                    'user': findRoleWithAdmin.db,
                }, { $addToSet: {
                    'customData.permissions': {
                        user: user.user,
                        permissions: ['teamspace_admin']
                    }
                }});

            } else {

                print('adding teamsapce admin permission');

                db.system.users.update({
                    'user': findRoleWithAdmin.db,
                    'customData.permissions.user': user.user
                }, { $addToSet: {
                    'customData.permissions.$.permissions': 'teamspace_admin'
                }});
            }

        } else {
        
            roles.forEach(function(role){

                print('processing role ' + role.role + ' on db ' + role.db);

                var roleNameParts = role.role.split('.');
                var permTemplate = roleNameParts.length > 1 && roleNameParts[roleNameParts.length - 1];
                var project = roleNameParts[0];

                if(permTemplate !== 'collaborator' && permTemplate !== 'viewer' && permTemplate !== 'commenter'){
                    var roleDetail = db.system.roles.findOne(role);

                    if(roleDetail){
                        var actions = roleDetail.privileges.find(function(p){ 
                            return p.resource.collection.endsWith('.history')
                        }).actions;

                        if(actions.indexOf('insert') !== -1){
                            permTemplate = 'collaborator';
                        } else {
                            permTemplate = 'viewer';
                        }

                        // convert this custom role to job
                        print('creating job for this role as it is a custom role');
                        db.system.users.update({ _id: user._id},{
                            '$addToSet': {
                                'customData.jobs':{
                                    _id: role.role
                                }
                            }
                        });
                    }
                }

                if(!permTemplate){
                    print('WARNING: Cannot find role definition in system.roles for role [' + role.role + ']. Possibly a mongodb role which its permissions cannot be translate into our system\'s context. Skipping all migration procedures for this role.')
                    return;
                }

                print('template: ' + permTemplate + ' will be used for this role');

                print('add model to customData.models');
                db.system.users.update({ _id: user._id }, { '$addToSet': {
                    'customData.models': {
                        account: role.db,
                        model: project
                    }
                }});

                var currPerm = db.getSiblingDB(role.db).settings.findOne({ 
                    _id: project, 
                    'permissions.user': user.user 
                }, {
                    'permissions.$' : 1
                });

                if(currPerm){

                    var updatePerm = (
                        (permTemplate === 'commenter' && currPerm.permissions[0].permission === 'viewer') ||
                        (permTemplate === 'collaborator' && currPerm.permissions[0].permission !== 'collaborator')
                    );

                    if(updatePerm){
                        print('updating permission for this user on this role');
                        db.getSiblingDB(role.db).settings.update({ _id: project, 'permissions.user': user.user }, {
                            '$set':{
                                'permissions.$.permission': permTemplate
                            }
                        });
                    } else {
                        print('No permission will be added for this user on this role as there is already a more inclusive or the same template set in the database');
                    }

                } else {

                    print('adding permission for this user on this role');
                    db.getSiblingDB(role.db).settings.update({ _id: project}, {
                        '$addToSet':{
                            permissions: {
                                user: user.user,
                                permission: permTemplate
                            }
                        }
                    });
                }


            });

        }
    }

    print ('Finish processing user: ' + user.user);
    print ('-------------------------------------');
}

print('We are done.');