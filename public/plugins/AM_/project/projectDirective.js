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
        .directive("project", project);

    function project() {
        return {
            restrict: 'E',
            scope: {},
            controller: ProjectCtrl
        };
    }

    ProjectCtrl.$inject = ["EventService"];

    function ProjectCtrl(EventService) {
        var panelContent = {
            left: [],
            right: []
        };

        /*
        panelContent.left.push({
            type: "filter",
            title: "",
            show: true,
            help: "Filter content"
        });
        */
        panelContent.left.push({
            type: "tree",
            title: "Tree",
            show: true,
            help: "Model elements shown in a tree structure",
            icon: "fa-sitemap",
            hasFilter: true
        });
        /*
         panelContent.left.push({
         type: "viewpoints",
         title: "Viewpoints",
         show: false,
         help: "Show a list of saved viewpoints",
         icon: "fa-street-view"
         });
         panelContent.left.push({
         type: "meta",
         title: "Meta data",
         show: false,
         help: "Show all the Meta data",
         icon: "fa-map-o"
         });
         panelContent.left.push({
         type: "pdf",
         title: "PDF",
         show: false,
         help: "List associated PDF files",
         icon: "fa-file-pdf-o"
         });
         */

        panelContent.right.push({
            type: "issues",
            title: "Issues",
            show: true,
            help: "List current issues",
            icon: "fa-map-marker",
            hasFilter: true,
            canAdd: true,
            options: [
                {
                    value: "sortByDate",
                    label: "Sort by Date"
                }
            ]
        });
        panelContent.right.push({
            type: "clip",
            title: "Clip",
            show: false,
            help: "Clipping plane",
            icon: "fa-object-group"
        });

        EventService.send(EventService.EVENT.PANEL_CONTENT_SETUP, panelContent);
    }
}());
