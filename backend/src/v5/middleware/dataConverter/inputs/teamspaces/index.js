const { createResponseCode, templates } = require('../../../../utils/responseCodes');
const { respond } = require('../../../../utils/responder');
const { isTeamspaceAdmin } = require('../../../../utils/permissions/permissions');
const { getUserFromSession } = require('../../../../utils/sessions');
const { getUserByUsername } = require('../../../../models/users');

const Teamspaces = {};

Teamspaces.canRemoveTeamspaceMember = async (req, res, next) => {
    try {
        const user = getUserFromSession(req.session);
        const { teamspace, username } = req.params;      

        if (username === teamspace) {
			return respond(req, res, createResponseCode(templates.invalidArguments, 'A user cannot be removed from its own teamspace.'));
        }
        
        const isTsAdmin = await isTeamspaceAdmin(teamspace, user);
        if(username !== user && !isTsAdmin){
            return respond(req, res, createResponseCode(templates.invalidArguments, 
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
