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

    angular.module('3drepo')
        .factory('TreeService', TreeService);

    TreeService.$inject = ["$http", "$q", "StateManager", "ViewerService", "serverConfig"];

    function TreeService($http, $q, StateManager, ViewerService, serverConfig) {
        var state = StateManager.state,
            currentSelectedNodeId = null;

        var init = function () {
            var deferred = $q.defer(),
                url = "/" + state.account + "/" + state.project + "/revision/" + state.branch + "/head/fulltree.json";

            $http.get(serverConfig.apiUrl(url))
                .then(function(json) {
                    deferred.resolve(json.data);
                });

            return deferred.promise;
        };

        var search = function (searchString) {
            var deferred = $q.defer(),
                url = "/" + state.account + "/" + state.project + "/revision/" + state.branch + "/head/" + searchString + "/searchtree.json";

            $http.get(serverConfig.apiUrl(url))
                .then(function(json) {
                    deferred.resolve(json);
                });

            return deferred.promise;
        };

        var selectNode = function (nodeId) {
            if (nodeId === currentSelectedNodeId) {
                currentSelectedNodeId = null;
                $(document).trigger("objectSelected", [undefined, true]);
            }
            else {
                var rootObj = document.getElementById("model__" + nodeId);
                currentSelectedNodeId = nodeId;
                $(document).trigger("objectSelected", [rootObj, true]);
            }
        };

        var toggleNode = function (nodeId, state) {
            if (nodeId.indexOf("###") === 0)
            {
                var actualID = nodeId.slice(3);

                var idParts = actualID.split("__");
                var mpnodes = $("multipart[id^=" + idParts[0] + "__" + idParts[1] + "]");
                var objectID = idParts[idParts.length - 1];

                for(var i = 0; i < mpnodes.length; i++)
                {
                    var parts = mpnodes[i].getParts([objectID]);

                    if (parts.ids.length > 0)
                    {
                        parts.setVisibility(state);
                        ViewerService.defaultViewer.addHiddenPart(parts);
                    }
                }
            } else {
                var rootObj = document.getElementById("model__" + nodeId);
                rootObj.setAttribute("render", state.toString());
            }
        };

        return {
            init: init,
            search: search,
            selectNode: selectNode,
            toggleNode: toggleNode
        };
    }
}());
