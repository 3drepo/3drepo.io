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
.controller('SearchCtrl', ['$http', 'serverConfig', function($http, serverConfig)
{
	$scope.doSearch = function(val) {
		return $http.get(serverConfig.apiUrl('search.json'),
		{
			params: {
				user_company_name: val
			}
		}).then(function _loginCtrlGetThingsSuccess(res) {
			var users = res.data.users;
			var companies = res.data.companies.map(function(obj){ return obj.name; });

			users = users.map(function(user) {
				return user + " (User)";
			});

			companies = companies.map(function(company) {
				return company + " (Company)";
			});

			return users.concat(companies);
		});
	};
}]);

