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
        .directive("treeNode", treeNode);

    function treeNode ($compile) {
        return {
            restrict: 'E',
            templateUrl: 'treeNode.html',
            link: link,
            scope: {
                node: "=",
                showChildren: "=",
                onNodeSelected: "&onNodeSelected",
                onNodeToggled: "&onNodeToggled",
                selectedNode: "=",
                toggledNode: "=",
                filterText: "="
            },
            controller: TreeNodeCtrl,
            controllerAs: 'tn',
            bindToController: true
        };

        function link (scope, element) {
            if (angular.isArray(scope.tn.node.children)) {
                var node =
                    "<tree-nodes " +
                        "nodes='tn.node.children' " +
                        "show-children='tn.showChildren' " +
                        "ng-if='!tn.collapsed || tn.filtered' " +
                        "on-node-selected='tn.onNodeSelected({nodeId: nodeId})' " +
                        "on-node-toggled='tn.onNodeToggled({nodeId: nodeId})' " +
                        "selected-node='tn.selectedNode' " +
                        "toggled-node='tn.toggledNode' " +
                        "filter-text='tn.filterText'>" +
                    "</tree-nodes>";
                $compile(node)(scope, function(cloned){
                    element.append(cloned);
                });
            }
        }
    }

    TreeNodeCtrl.$inject = ['$scope', "$filter"];

    function TreeNodeCtrl ($scope, $filter) {
        var tn = this;
        tn.collapsed = true;
        tn.showCollapseButton = false;
        tn.toggleState = true;
        tn.selected = false;
        tn.selectedClass = "tree-node-unselected";

        $scope.$watchGroup(["tn.node", "tn.showChildren"], function (newValues) {
            if (angular.isDefined(newValues[0]) && angular.isDefined(newValues[1])) {
                tn.showCollapseButton = (newValues[0].children && (newValues[0].children.length > 0) && newValues[1]);
            }
        });

        $scope.$watch("tn.selectedNode", function (newValue) {
            if (angular.isDefined(newValue) && (newValue !== tn.node._id)) {
                tn.selectedClass = "tree-node-unselected";
                tn.selected = false;
            }
        });

        $scope.$watch("tn.toggledNode", function (newValue) {
            if (angular.isDefined(newValue) && (newValue !== tn.node._id)) {
                tn.toggleState = true;
            }
        });

        $scope.$watch("tn.filterText", function (newValue) {
            if (angular.isUndefined(newValue) || (tn.filterText === "")) {
                tn.filtered = false;
            }
            else {
                tn.filtered = $filter('uiTreeFilter')(tn.node, tn.filterText, ['name']);
                tn.collapsed = !tn.filtered;
            }
        });

        tn.collapse = function () {
            tn.collapsed = !tn.collapsed;
            tn.filtered = false;
        };

        tn.nodeSelected = function (nodeId) {
            tn.onNodeSelected({nodeId: nodeId});
            tn.selected = !tn.selected;
            tn.selectedClass = tn.selected ? "tree-node-selected" : "tree-node-unselected";
        };

        tn.nodeToggled = function (nodeId) {
            tn.toggleState = !tn.toggleState;
            tn.onNodeToggled({nodeId: nodeId});
        };
    }
}());
