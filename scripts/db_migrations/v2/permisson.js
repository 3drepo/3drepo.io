// add basic licence if dun have one
print('init: create basic licence for everyone if they do not have one');
db.getSiblingDB('admin').system.users.update({ 'customData.billing.subscriptions.plan': {'$ne':'BASIC'}}, { 
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
db.getSiblingDB('admin').system.users.update({}, { '$addToSet': {
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

var users = db.getSiblingDB('admin').system.users.find();
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
            var count = db.getSiblingDB('admin').system.users.count({
                'user': findRoleWithAdmin.db,
                'customData.permissions.user': user.user
            });

            if(count === 0){

                print('creating teamsapce admin permission');

                db.getSiblingDB('admin').system.users.update({
                    'user': findRoleWithAdmin.db,
                }, { $addToSet: {
                    'customData.permissions': {
                        user: user.user,
                        permissions: ['teamspace_admin']
                    }
                }});

            } else {

                print('adding teamsapce admin permission');

                db.getSiblingDB('admin').system.users.update({
                    'user': findRoleWithAdmin.db,
                    'customData.permissions.user': user.user
                }, { $addToSet: {
                    'customData.permissions.$.permissions': 'teamspace_admin'
                }});
            }
        }

     
        roles.forEach(function(role){

            if(role.role === 'admin' || role.role === 'readWrite'){
                return;
            }

            print('processing role ' + role.role + ' on db ' + role.db);

            var roleNameParts = role.role.split('.');
            var permTemplate = roleNameParts.length > 1 && roleNameParts[roleNameParts.length - 1];
            var model = roleNameParts[0];

            if(permTemplate !== 'collaborator' && permTemplate !== 'viewer' && permTemplate !== 'commenter'){
                var roleDetail = db.getSiblingDB('admin').system.roles.findOne(role);

                if(roleDetail){
                    var actions = roleDetail.privileges.find(function(p){ 
                        return p.resource.collection.endsWith('.history')
                    }).actions;

                    if(actions.indexOf('insert') !== -1){
                        permTemplate = 'collaborator';
                    } else {
                        permTemplate = 'viewer';
                    }

                    if(roleDetail.privileges[0] && roleDetail.privileges[0].resource && roleDetail.privileges[0].resource.collection){
                        model = roleDetail.privileges[0].resource.collection.split('.')[0];
                    }
                    // convert this custom role to job
                    print('creating job for this role as it is a custom role');
                    
                    var color = db.getSiblingDB(role.db).settings.roles.findOne({ _id: role.role});
                    if(color){
                        color = color.color;
                    }

                    db.getSiblingDB('admin').system.users.update({ user: role.db},{
                        '$addToSet': {
                            'customData.jobs':{
                                _id: role.role,
                                color: color
                            }
                        }
                    });

                    //assign job to this users
                    print('assign job to user');
                    var res = db.getSiblingDB('admin').system.users.update({user: role.db, 'customData.billing.subscriptions.assignedUser': user.user},{
                        '$set': {
                            'customData.billing.subscriptions.$.job': role.role
                        }
                    })

                    if(res.nMatched === 0){
                        print('WARNING: Cannot assign job ' + role.role + ' to user ' + user.user + ' because there is no subscription assigned to this user.')
                    }
                }
            }

            if(findRoleWithAdmin){
                print('admin role found in this database therefore ignoring all other permissions (as they are redundant)');
                return;
            }

            if(!permTemplate){
                print('WARNING: Cannot find role definition in system.roles for role [' + role.role + ']. Possibly a mongodb role which its permissions cannot be translate into our system\'s context. Skipping all migration procedures for this role.')
                return;
            }

            print('template: ' + permTemplate + ' will be used for this role');

            print('add model to customData.models');
            db.getSiblingDB('admin').system.users.update({ _id: user._id }, { '$addToSet': {
                'customData.models': {
                    account: role.db,
                    model: model
                }
            }});

            var currPerm = db.getSiblingDB(role.db).settings.findOne({ 
                _id: model, 
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
                    db.getSiblingDB(role.db).settings.update({ _id: model, 'permissions.user': user.user }, {
                        '$set':{
                            'permissions.$.permission': permTemplate
                        }
                    });
                } else {
                    print('No permission will be added for this user on this role as there is already a more inclusive or the same template set in the database');
                }

            } else {

                print('adding permission for this user on this role');
                db.getSiblingDB(role.db).settings.update({ _id: model}, {
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

    print ('Finish processing user: ' + user.user);
    print ('-------------------------------------');
}

print('We are done.');