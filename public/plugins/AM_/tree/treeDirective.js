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
        .directive("tree", tree)
        .config(function (uiTreeFilterSettingsProvider) {
            uiTreeFilterSettingsProvider.descendantCollection = 'children';
        });

    function tree() {
        return {
            restrict: 'EA',
            templateUrl: 'tree.html',
            scope: {
                filterText: "="
            },
            controller: TreeCtrl,
            controllerAs: 'tr',
            bindToController: true
        };
    }

    TreeCtrl.$inject = ["$scope", "TreeService"];

    function TreeCtrl($scope, TreeService) {
        var tr = this,
            promise = null;
        tr.nodes = [];
        tr.showTree = false;

        /*
        tr.allNodes = [
            {
                id: 1,
                name: '1. dragon-breath',
                description: 'lorem ipsum dolor sit amet',
            },
            {
                id: 2,
                name: '2. moiré-vision',
                description: 'Ut tempus magna id nibh',
                children: [
                    {
                        id: 21,
                        name: '2.1. tofu-animation',
                        description: 'Sed nec diam laoreet, aliquam',
                        children: [
                            {
                                id: 211,
                                name: '2.1.1. spooky-giraffe',
                                description: 'In vel imperdiet justo. Ut',
                            },
                            {
                                id: 212,
                                name: '2.1.2. bubble-burst',
                                description: 'Maecenas sodales a ante at',
                            }
                        ]
                    },
                    {
                        id: 22,
                        name: '2.2. barehand-atomsplitting',
                        description: 'Fusce ut tellus posuere sapien',
                    }
                ]
            },
            {
                id: 3,
                name: '3. unicorn-zapper',
                description: 'Integer ullamcorper nibh eu ipsum',
            },
            {
                id: 4,
                name: '4. romantic-transclusion',
                description: 'Nullam luctus velit eget enim',
            }
        ];
        tr.nodes = tr.allNodes;
        tr.showChildren = true;
        tr.showTree = true;
        */

        promise = TreeService.init();
        promise.then(function(data) {
            tr.showChildren = true;
            tr.allNodes = [];
            tr.allNodes.push(data);
            tr.nodes = tr.allNodes;
            tr.showTree = true;
        });

        /*
        $scope.$watch("tr.filterText", function (newValue) {
            if (angular.isDefined(newValue)) {
                if (newValue === "") {
                    tr.showChildren = true;
                    tr.nodes = tr.allNodes;
                }
                else {
                    tr.showChildren = true;
                    promise = TreeService.search(newValue);
                    promise.then(function(json) {
                        tr.showChildren = false;
                        tr.nodes = json.data;
                    });
                }
            }
        });
        */

        tr.nodeSelected = function (nodeId) {
            tr.selectedNode = nodeId;
            TreeService.selectNode(nodeId);
        };

        tr.nodeToggled = function (nodeId) {
            tr.toggledNode = nodeId;
            TreeService.toggleNode(nodeId);
            tr.data.openNodes.push(nodeId);
        };
    }
}());
