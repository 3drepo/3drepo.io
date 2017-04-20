(() => {
	"use strict";

	function checkPermissions(username, account, projectGroup, project, permsRequest, getPermissions){

		let getPermPromises = [];

		// check what kind of permissions is requested before making db calls to save unnecessary db calls

		if(_.intersection(C.ACCOUNT_PERM_LIST, perms).length > 0){
			getPermPromises.push(getPermissions(account).accountLevel(username));
		}

		if(_.intersection(C.PROJECT_PERM_LIST, perms).length > 0){
			getPermPromises.push(getPermissions(account).projectLevel(username, projectGroup));
		}

		if(_.intersection(C.MODEL_PERM_LIST, perms).length > 0){
			getPermPromises.push(getPermissions(account).modelLevel(username, project));

		}

		return Promise.all(getPermPromises).then(permissions => {
			permissions = _.flatten(permissions);
			//return true if user has the requested permissions
			return _.difference(permsRequest, permissions).length === 0;
		});
	}

	model.exports = checkPermissions;

})();
