/**
 *  Copyright (C) 2014 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

angular.module('3drepo')
.factory('ProjectData', ['$http', '$q', 'serverConfig', function($http, $q, serverConfig){
	var o = {};

	o.projectTypes = [
		{label: 'Architectural', value : 1},
		{label: 'Aerospace', value: 2},
		{label: 'Automotive', value: 3},
		{label: 'Enginering', value: 4},
		{label: 'Other', value: 5}
	];

	o.roleIndex = {
		OWNER: 0,
		USER: 1,
		PUBLIC: 2
	};

	o.bitMasks = {
		READ_BIT:		4,
		WRITE_BIT:		2,
		EXECUTE_BIT:	1
	};

	o.refresh = function(account, project) {
		var self = this;

		self.name		= "";
		self.owner		= "";
		self.description= "";
		self.branches	= [];

		self.account = account;
		self.project = project;

		self.selected = null;
		self.loading  = true;

		self.publicPerm		= {read: false, write: false, execute: false};
		self.userPerm		= {read: false, write: false, execute: false};
		self.ownerPerm		= {read: false, write: false, execute: false};

		self.visibility = 'private';

		var deferred = $q.defer();

		$http.get(serverConfig.apiUrl(account + '/' + project + '.json')).success(function(json, status) {
			self.name				= project;
			self.owner				= json.owner;
			self.description		= json.desc;
			self.type				= json.type;
			self.selected			= self.projectTypes[0];

			for(var i = 0; i < self.projectTypes.length; i++)
			{
				if (self.projectTypes[i].label.toLowerCase() == self.type.toLowerCase())
				{
					self.selected = self.projectTypes[i];
					break;
				}
			}

			// Public permissions
			self.publicPerm.read = (json.permissions[self.roleIndex["PUBLIC"]] & self.bitMasks["READ_BIT"]) > 0;
			self.publicPerm.write = (json.permissions[self.roleIndex["PUBLIC"]] & self.bitMasks["WRITE_BIT"]) > 0;
			self.publicPerm.execute = (json.permissions[self.roleIndex["PUBLIC"]] & self.bitMasks["EXECUTE_BIT"]) > 0;

			// User permissions
			self.userPerm.read = (json.permissions[self.roleIndex["USER"]] & self.bitMasks["READ_BIT"]) > 0;
			self.userPerm.write = (json.permissions[self.roleIndex["USER"]] & self.bitMasks["WRITE_BIT"]) > 0;
			self.userPerm.execute = (json.permissions[self.roleIndex["USER"]] & self.bitMasks["EXECUTE_BIT"]) > 0;

			// Owner permissions
			self.ownerPerm.read = (json.permissions[self.roleIndex["OWNER"]] & self.bitMasks["READ_BIT"]) > 0;
			self.ownerPerm.write = (json.permissions[self.roleIndex["OWNER"]] & self.bitMasks["WRITE_BIT"]) > 0;
			self.ownerPerm.execute = (json.permissions[self.roleIndex["OWNER"]] & self.bitMasks["EXECUTE_BIT"]) > 0;

			self.loading = false;

			// Update viewer - disgusting
			viewer.updateSettings(json.properties);

			deferred.resolve();
		});

		return deferred.promise;
	};

	o.updateInfo = function()
	{
		var newInfo = {
			type:			this.type,
			description:	this.description
		};

		return $http.post(serverConfig.apiUrl(self.account + '/' + self.project), newInfo);
	}

	return o;
}]);

