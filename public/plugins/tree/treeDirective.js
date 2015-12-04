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
        .directive("tree", tree);

    function tree() {
        return {
            restrict: "EA",
            templateUrl: "tree.html",
            scope: {
                filterText: "=",
                height: "="
            },
            controller: TreeCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    TreeCtrl.$inject = ["$scope", "$timeout", "$filter", "TreeService", "ViewerService"];

    function TreeCtrl($scope, $timeout, $filter, TreeService, ViewerService) {
        var vm = this,
            promise = null,
            item = {},
            i = 0,
            length = 0;
        vm.nodes = [];
        vm.showTree = false;
        vm.showFilterList = true;
        vm.currentFilterItemSelected = null;
        vm.viewerSelectedObject = null;

        promise = TreeService.init();
        promise.then(function(data) {
            vm.showChildren = true;
            vm.allNodes = [];
            vm.allNodes.push(data.nodes);
            vm.nodes = vm.allNodes;
            vm.showTree = true;
            vm.idToName = data.idToName;
        });

        $scope.$watch("vm.filterText", function (newValue) {
            if (angular.isDefined(newValue)) {
                if (newValue === "") {
                    vm.showTree = true;
                    vm.showFilterList = false;
                    vm.showChildren = true;
                    vm.nodes = vm.allNodes;
                }
                else {
                    vm.showTree = false;
                    vm.showFilterList = true;
                    vm.showChildren = true;

                    if (vm.filterText.indexOf("###") === 0)
                    {
                        vm.showChildren = false;

                        $timeout(angular.noop, 300).then(angular.bind(this, function() {
                            vm.nodes = [{}];
                            vm.nodes[0]._id = vm.origID;
                            vm.nodes[0].name = vm.objectName;
                            vm.nodes[0].index = 0;
                            vm.nodes[0].toggleState = true;
                            vm.nodes[0].class = "unselectedFilterItem";

                            setupInfiniteItems();
                        }));

                    } else {
                        promise = TreeService.search(newValue);
                        promise.then(function(json) {
                            vm.showChildren = false;
                            vm.nodes = json.data;
                            // If an object has been selected in the viewer to prompt this filter, only show the node
                            // with the exact name of the selected object (this needs rethinking as showing the selected
                            // object shouldn't trigger the filter)
                            if (vm.viewerSelectedObject !== null) {
                                for (i = (vm.nodes.length - 1); i >= 0; i -= 1) {
                                    if (vm.nodes[i].name !== vm.viewerSelectedObject.name) {
                                        vm.nodes.splice(i, 1);
                                    }
                                }
                            }
                            for (i = 0, length = vm.nodes.length; i < length; i += 1) {
                                vm.nodes[i].index = i;
                                vm.nodes[i].toggleState = true;
                                vm.nodes[i].class = "unselectedFilterItem";
                            }
                            setupInfiniteItems();
                        });
                    }
                }
            }
        });

        vm.nodeSelected = function (nodeId) {
            vm.selectedNode = nodeId;
            TreeService.selectNode(nodeId);
        };

        vm.nodeToggled = function (nodeId, state) {
            vm.toggledNode = nodeId;
            TreeService.toggleNode(nodeId, state);
        };

        vm.filterItemSelected = function (item) {
            if (vm.currentFilterItemSelected === null) {
                vm.nodes[item.index].class = "selectedFilterItem";
                vm.currentFilterItemSelected = item;
            }
            else if (item.index === vm.currentFilterItemSelected.index) {
                vm.nodes[item.index].class = "unselectedFilterItem";
                vm.currentFilterItemSelected = null;
            }
            else {
                vm.nodes[vm.currentFilterItemSelected.index].class = "unselectedFilterItem";
                vm.nodes[item.index].class = "selectedFilterItem";
                vm.currentFilterItemSelected = item;
            }
            TreeService.selectNode(vm.nodes[item.index]._id);
        };

        vm.filterItemToggled = function (item) {
            TreeService.toggleNode(item._id);
        };

        function setupInfiniteItems () {
            vm.infiniteItems = {
                numLoaded_: 0,
                toLoad_: 0,
                getItemAtIndex: function(index) {
                    if (index > this.numLoaded_) {
                        this.fetchMoreItems_(index);
                        return null;
                    }

                    if (index < vm.nodes.length) {
                        return vm.nodes[index];
                    }
                    else {
                        return null;
                    }
                },
                getLength: function() {
                    return this.numLoaded_ + 5;
                },
                fetchMoreItems_: function(index) {
                    if (this.toLoad_ < index) {
                        this.toLoad_ += 20;
                        $timeout(angular.noop, 300).then(angular.bind(this, function() {
                            this.numLoaded_ = this.toLoad_;
                        }));
                    }
                }
            };
        }

        $(document).on("objectSelected", function(event, object, zoom) {
            $timeout(function () {
                if (angular.isUndefined(object)) {
                    vm.viewerSelectedObject = null;
                    vm.filterText = "";
                } else {
                    var objectID = null;
                    var idParts  = null;

                    if (object["multipart"])
                    {
                        idParts = object.id.split("__");
                    } else {
                        idParts = object.getAttribute("id").split("__");
                    }

                    objectID = idParts[idParts.length - 1];

                    if (objectID === vm.idToName[objectID])
                    {
                        vm.filterText = "###" + vm.idToName[objectID];

                        vm.objectName    = objectID;
                        vm.origID        = "###" + object.id;
                    } else {
                        vm.filterText    = vm.idToName[objectID];
                    }
                }
            });
        });

        $(document).on("partSelected", function(event, part, zoom) {
            $scope.IssuesService.mapPromise.then(function () {
                vm.viewerSelectedObject = $filter('filter')(vm.idToName, {_id: $scope.IssuesService.IDMap[part.partID]})[0];
                vm.filterText = vm.viewSelectedObject;
            });
        });
    }
}());
