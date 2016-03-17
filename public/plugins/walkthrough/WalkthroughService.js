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

(function () {
    "use strict";

    angular.module("3drepo")
        .factory("WalkthroughService", WalkthroughService);

    WalkthroughService.$inject = ["$interval", "$timeout", "$q", "$http", "serverConfig"];

    function WalkthroughService($interval, $timeout, $q, $http, serverConfig) {
        var walkthroughs = {},
            //userControlTimeout = null,
			loading = null;

        function getWalkthroughs(account, project, index) {
			var projectKey = account + "__" + project;

			if (angular.isUndefined(index))
			{
				index = "all";
			}

            var url = "/" + account + "/" + project + "/walkthrough/" + index + ".json",
                i = 0,
                length = 0;

			loading = $q.defer();
			var needLoading = false;

			if (!walkthroughs.hasOwnProperty(projectKey))
			{
				walkthroughs[projectKey] = [];
				needLoading = true;
			} else {
				if (!walkthroughs[projectKey].hasOwnProperty(index))
				{
					needLoading = true;
				}
			}

			if (needLoading)
			{
				$http.get(serverConfig.apiUrl(url))
					.then(function(data) {
						for (i = 0, length = data.data.length; i < length; i++) {
							walkthroughs[projectKey][data.data[i].index] = data.data[i].cameraData;
						}

						loading.resolve(walkthroughs[projectKey][index]);
					});
			} else {
				loading.resolve(walkthroughs[projectKey][index]);
			}

			return loading.promise;
        }

		var saveRecording = function (account, project, index, recording) {
            var postUrl = "/" + account + "/" + project + "/walkthrough";
			var projectKey = account + "__" + project;

			walkthroughs[projectKey][index] = recording;

            $http.post(serverConfig.apiUrl(postUrl), {index: index, cameraData: recording})
                .then(function() {
                    //console.log(json);
                });
        };

        return {
            saveRecording: saveRecording,
            getWalkthroughs: getWalkthroughs
        };
    }
}());
