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
        .factory('NewIssuesService', NewIssuesService);

    NewIssuesService.$inject = ["$http", "$q", "StateManager", "serverConfig", "ViewerService"];

    function NewIssuesService($http, $q, StateManager, serverConfig, ViewerService) {
        var state = StateManager.state,
            deferred = null,
            url = "",
            data = {},
            config = {},
            i, j = 0,
            numIssues = 0,
            numComments = 0,
            pinCoverage = 15.0,
            pinRadius = 0.25,
            pinHeight = 1.0,
            currentPinId = null;

        var prettyTime = function(time) {
            var date = new Date(time);
            return (
                date.getFullYear() + "-" +
                (date.getMonth() + 1) + "-" +
                date.getDate()
            );
        };

        var getIssues = function () {
            deferred = $q.defer();
            url = serverConfig.apiUrl(state.account + '/' + state.project + '/issues.json');

            $http.get(url)
                .then(function(data) {
                    deferred.resolve(data.data);
                    // Convert created field to displayable time stamp
                    // Issue
                    for (i = 0, numIssues = data.data.length; i < numIssues; i += 1) {
                        data.data[i].timeStamp = prettyTime(data.data[i].created);
                        // Comments
                        if (data.data[i].hasOwnProperty("comments")) {
                            for (j = 0, numComments = data.data[i].comments.length; j < numComments; j += 1) {
                                if (data.data[i].comments[j].hasOwnProperty("created")) {
                                    data.data[i].comments[j].timeStamp = prettyTime(data.data[i].comments[j].created);
                                }
                            }
                        }
                    }
                });

            return deferred.promise;
        };

        var saveIssue = function (account, project, name, objectId, pickedPos, pickedNorm) {
            var currentVP = ViewerService.defaultViewer.getCurrentViewpointInfo(),
                dataToSend = {};

            deferred = $q.defer();
            url = serverConfig.apiUrl(account + "/" + project + "/issues/" + objectId);

            data = {
                name: name,
                viewpoint: ViewerService.defaultViewer.getCurrentViewpointInfo(),
                scale: 1.0
            };
            config = {
                withCredentials: true
            };

            if (pickedPos !== null) {
                data.position = pickedPos.toGL();
                data.norm = pickedNorm.toGL();
                data.scale = pinCoverage / pinPixelSize;
            }

            dataToSend = {data: JSON.stringify(data)};

            $http.post(url, dataToSend, config)
                .then(function successCallback(response) {
                    console.log(response);
                    response.data.issue.account = state.account;
                    response.data.issue.project = state.project;
                    response.data.issue.timeStamp = prettyTime(response.data.issue.created);

                    if (pickedPos !== null) {
                        fixPin({
                            id: response._id,
                            position: data.position,
                            norm: data.norm
                        });
                    }
                    deferred.resolve(response.data.issue);
                });

            return deferred.promise;
        };

        var closeIssue = function (issue) {
            deferred = $q.defer();
            url = serverConfig.apiUrl(issue.account + "/" + issue.project + "/issues/" + issue.parent);
            data = {
                data: JSON.stringify({
                    _id: issue._id,
                    closed: true,
                    number: issue.number
                })
            };
            config = {
                withCredentials: true
            };

            $http.post(url, data, config)
                .then(function successCallback(response) {
                    deferred.resolve(response.data);
                });

            return deferred.promise;
        };

        var saveComment = function (issue, comment) {
            deferred = $q.defer();
            url = serverConfig.apiUrl(issue.account + "/" + issue.project + "/issues/" + issue.parent);
            data = {
                data: JSON.stringify({
                    _id: issue._id,
                    comment: comment,
                    number: issue.number
                })
            };
            config = {
                withCredentials: true
            };

            $http.post(url, data, config)
                .then(function successCallback(response) {
                    deferred.resolve(response.data);
                });

            return deferred.promise;
        };

        function addPin (pin) {
            removePin();

            createPinShape("pinPlacement", pin, pinRadius, pinHeight);
         }

        function removePin () {
            var pinPlacement = document.getElementById("pinPlacement");
            if (pinPlacement !== null) {
               pinPlacement.parentElement.removeChild(pinPlacement) 
            }
        }

        function fixPin (pin) {
            createPinShape(pin.id, pin, pinRadius, pinHeight);
        }

        function createPinShape (id, pin, radius, height, scale)
        {   
            var sceneBBox = ViewerService.defaultViewer.scene._x3domNode.getVolume();
            var sceneSize = sceneBBox.max.subtract(sceneBBox.min).length();
            var scale     = sceneSize / 20;

            if (ViewerService.defaultViewer.pinSize)
            {
                scale = ViewerService.defaultViewer.pinSize;
            }

            var parent = document.createElement("Transform");
            parent.setAttribute("id", id);
            var position = new x3dom.fields.SFVec3f(pin.position[0], pin.position[1], pin.position[2]);

            // Transform the pin into the coordinate frame of the parent
            parent.setAttribute("translation", position.toString());

            var norm = new x3dom.fields.SFVec3f(pin.norm[0], pin.norm[1], pin.norm[2]);

            // Transform the normal into the coordinate frame of the parent
            var axisAngle = ViewerService.defaultViewer.rotAxisAngle([0,1,0], norm.toGL());

            parent.setAttribute("rotation", axisAngle.toString());

            $("#" + pin.account + "__" + pin.project + "__root")[0].appendChild(parent);

            var coneHeight = height - radius;
            var pinshape = document.createElement("Group");
            pinshape.setAttribute('onclick', 'clickPin(event)');

            var pinshapeapp = document.createElement("Appearance");
            pinshape.appendChild(pinshapeapp);

            var pinshapedepth = document.createElement("DepthMode");
            pinshapedepth.setAttribute("depthFunc", "ALWAYS");
            pinshapedepth.setAttribute("enableDepthTest", "false");
            pinshapeapp.appendChild(pinshapedepth);

            var pinshapemat = document.createElement("Material");
            pinshapemat.setAttribute("diffuseColor", "1.0 0.0 0.0");
            pinshapeapp.appendChild(pinshapemat);

            var pinshapescale = document.createElement("Transform");
            pinshapescale.setAttribute("scale", scale + " " + scale + " " + scale);
            pinshape.appendChild(pinshapescale);

            var pinshapeconetrans = document.createElement("Transform");
            pinshapeconetrans.setAttribute("translation", "0.0 " + (0.5 * coneHeight) + " 0.0");
            pinshapescale.appendChild(pinshapeconetrans);

            var pinshapeconerot = document.createElement("Transform");

            pinshapeconerot.setAttribute("rotation", "1.0 0.0 0.0 3.1416");
            pinshapeconetrans.appendChild(pinshapeconerot);

            var pinshapeconeshape = document.createElement("Shape");
            pinshapeconerot.appendChild(pinshapeconeshape);

            var pinshapecone = document.createElement("Cone");
            pinshapecone.setAttribute("bottomRadius", (radius * 0.5).toString());
            pinshapecone.setAttribute("height", coneHeight.toString());

            var coneApp = pinshapeapp.cloneNode(true);

            pinshapeconeshape.appendChild(pinshapecone);
            pinshapeconeshape.appendChild(coneApp);

            var pinshapeballtrans = document.createElement("Transform");
            pinshapeballtrans.setAttribute("translation", "0.0 " + coneHeight + " 0.0");
            pinshapescale.appendChild(pinshapeballtrans);

            var pinshapeballshape = document.createElement("Shape");
            pinshapeballtrans.appendChild(pinshapeballshape);

            var pinshapeball = document.createElement("Sphere");
            pinshapeball.setAttribute("radius", radius);

            var ballApp = pinshapeapp.cloneNode(true);

            pinshapeballshape.appendChild(pinshapeball);
            pinshapeballshape.appendChild(ballApp);

            parent.appendChild(pinshape);
        }

        return {
            prettyTime: prettyTime,
            getIssues: getIssues,
            saveIssue: saveIssue,
            closeIssue: closeIssue,
            saveComment: saveComment,
            addPin: addPin,
            fixPin: fixPin,
            removePin: removePin
        };
    }
}());
