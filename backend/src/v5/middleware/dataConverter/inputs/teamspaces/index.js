const { createResponseCode, templates } = require('../../../../utils/responseCodes');
const { UUIDToString } = require('../../../../utils/helper/uuids');
const Yup = require('yup');
const { respond } = require('../../../../utils/responder');
const { types } = require('../../../../utils/helper/yup');
const { isTeamspaceAdmin } = require('../../../../utils/permissions/permissions');
const { getUserFromSession } = require('../../../../utils/sessions');
const { getUserByUsername } = require('../../../../models/users');

const Teamspaces = {};

Teamspaces.canRemoveTeamMember = async (req, res, next) => {
    try {
        const user = getUserFromSession(req.session);
        const { teamspace, username } = req.params;      

        if (username === teamspace) {
			respond(req, res, createResponseCode(templates.invalidArguments, 'A user cannot be removed from its own teamspace.'));
        }
        
        if(username !== user && !isTeamspaceAdmin(teamspace, user)){
            respond(req, res, createResponseCode(templates.invalidArguments, 
                'Admin permissions are required to remove another user from a teamspace.'));
        }

        //ensure the user exists
        await getUserByUsername(username);

        await next();
    } catch (err) {
        respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
    }
};

module.exports = Teamspaces;
