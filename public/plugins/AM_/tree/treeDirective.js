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
            restrict: 'EA',
            templateUrl: 'tree.html',
            scope: {
                filterText: "=",
                height: "="
            },
            controller: TreeCtrl,
            controllerAs: 'tr',
            bindToController: true
        };
    }

    TreeCtrl.$inject = ["$scope", "$timeout", "TreeService"];

    function TreeCtrl($scope, $timeout, TreeService) {
        var tr = this,
            promise = null,
            item = {},
            i = 0,
            length = 0;
        tr.nodes = [];
        tr.showTree = false;
        tr.showFilterList = true;
        tr.currentFilterItemSelected = null;

        promise = TreeService.init();
        promise.then(function(data) {
            tr.showChildren = true;
            tr.allNodes = [];
            tr.allNodes.push(data);
            tr.nodes = tr.allNodes;
            tr.showTree = true;
        });

        $scope.$watch("tr.filterText", function (newValue) {
            if (angular.isDefined(newValue)) {
                if (newValue === "") {
                    tr.showTree = true;
                    tr.showFilterList = false;
                    tr.showChildren = true;
                    tr.nodes = tr.allNodes;
                }
                else {
                    tr.showTree = false;
                    tr.showFilterList = true;
                    tr.showChildren = true;
                    promise = TreeService.search(newValue);
                    promise.then(function(json) {
                        tr.showChildren = false;
                        tr.nodes = json.data;
                        for (i = 0, length = tr.nodes.length; i < length; i += 1) {
                            tr.nodes[i].index = i;
                            tr.nodes[i].toggleState = true;
                            tr.nodes[i].class = "unselectedFilterItem";
                        }
                        setupInfiniteItems();
                    });
                }
            }
        });

        tr.nodeSelected = function (nodeId) {
            tr.selectedNode = nodeId;
            TreeService.selectNode(nodeId);
        };

        tr.nodeToggled = function (nodeId) {
            tr.toggledNode = nodeId;
            TreeService.toggleNode(nodeId);
        };

        tr.filterItemSelected = function (item) {
            if (tr.currentFilterItemSelected === null) {
                tr.nodes[item.index].class = "selectedFilterItem";
                tr.currentFilterItemSelected = item;
            }
            else if (item.index === tr.currentFilterItemSelected.index) {
                tr.nodes[item.index].class = "unselectedFilterItem";
                tr.currentFilterItemSelected = null;
            }
            else {
                tr.nodes[tr.currentFilterItemSelected.index].class = "unselectedFilterItem";
                tr.nodes[item.index].class = "selectedFilterItem";
                tr.currentFilterItemSelected = item;
            }
            TreeService.selectNode(tr.nodes[item.index]._id);
        };

        tr.filterItemToggled = function (item) {
            tr.nodes[item.index].toggleState = !tr.nodes[item.index].toggleState;
            TreeService.toggleNode(item._id);
        };

        function setupInfiniteItems () {
            tr.infiniteItems = {
                numLoaded_: 0,
                toLoad_: 0,
                getItemAtIndex: function(index) {
                    if (index > this.numLoaded_) {
                        this.fetchMoreItems_(index);
                        return null;
                    }

                    if (index < tr.nodes.length) {
                        return tr.nodes[index];
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
    }
}());
