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
        .directive("home", home)
        .config(function($mdThemingProvider) {
            $mdThemingProvider.theme('default')
                .primaryPalette('indigo', {
                    'default': '500',
                    'hue-1': '400',
                    'hue-2': '200',
                    'hue-3': '50'
                })
                .accentPalette('orange', {
                    'default': '600'
                })
                .warnPalette('red');
        });

    function home() {
        return {
            restrict: 'E',
            templateUrl: 'home.html',
            scope: {},
            controller: HomeCtrl,
            controllerAs: 'hm',
            bindToController: true
        };
    }

    HomeCtrl.$inject = ["EventService"];

    function HomeCtrl(EventService) {
        var hm = this,
            panelContent = {
                left: [
                    {
                        type: "filter",
                        title: "",
                        show: true,
                        help: "Filter content"
                    },
                    {
                        type: "tree",
                        title: "Tree",
                        show: true,
                        help: "Model elements shown in a tree structure",
                        buttonIcon: "fa-sitemap"
                    },
                    {
                        type: "viewpoints",
                        title: "Viewpoints",
                        show: false,
                        help: "Show a list of saved viewpoints",
                        buttonIcon: "fa-street-view"
                    },
                    {
                        type: "meta",
                        title: "Meta data",
                        show: false,
                        help: "Show all the Meta data",
                        buttonIcon: "fa-map-o"
                    },
                    {
                        type: "pdf",
                        title: "PDF",
                        show: false,
                        help: "List associated PDF files",
                        buttonIcon: "fa-file-pdf-o"
                    }
                ],
                right: [
                    {
                        type: "issues",
                        title: "Issues",
                        show: true,
                        help: "List current issues",
                        buttonIcon: "fa-cogs"
                    }
                ]
            };
        EventService.send(EventService.EVENT.PANEL_CONTENT_SETUP, panelContent);
    }
}());

