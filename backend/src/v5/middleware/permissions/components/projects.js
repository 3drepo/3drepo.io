 const { hasProjectAdminPermissions, isTeamspaceAdmin } = require('../../../utils/permissions/permissions');
 const { getProjectById } = require('../../../models/projects');
 const { getUserFromSession } = require('../../../utils/sessions');
 const { respond } = require('../../../utils/responder');
 const { templates } = require('../../../utils/responseCodes');
 
 const ProjectPerms = {};
 
 ProjectPerms.isProjectAdmin = async (req, res, next) => {
     const { session, params } = req;
     const user = getUserFromSession(session);
     const { teamspace, project } = params;
 
     const { permissions } = await getProjectById(teamspace, project, { permissions: 1 });
 
     const isTSAdmin = await isTeamspaceAdmin(teamspace, user);
     const isAdmin = isTSAdmin || hasProjectAdminPermissions(permissions, user);
 
     if (teamspace && project && user && isAdmin) {
         next();
     } else {
         respond(req, res, templates.notAuthorized);
     }
 };
 
 module.exports = ProjectPerms;