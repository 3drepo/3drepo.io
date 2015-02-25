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

	o.refresh = function(account, project) {
		var self = this;

		self.name		= "";
		self.owner		= "";
		self.description= "";
		self.branches	= [];

		self.account = account;
		self.project = project;

		self.selected = null;

		var deferred = $q.defer();

		$http.get(serverConfig.apiUrl(account + '/' + project + '.json')).success(function(json, status) {
			self.name		 = project;
			self.owner		 = json.owner;
			self.description = json.desc;
			self.type        = json.type;
			self.selected    = self.projectTypes[0];

			for(var i = 0; i < self.projectTypes.length; i++)
			{
				if (self.projectTypes[i].label.toLowerCase() == self.type.toLowerCase())
				{
					self.selected = self.projectTypes[i];
					break;
				}
			}

			self.visibility = json.read_access;

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

