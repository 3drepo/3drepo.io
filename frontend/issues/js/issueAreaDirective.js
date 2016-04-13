/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function() {
    "use strict";

    angular.module("3drepo")
        .directive("issueArea", issueArea);

    function issueArea() {
        return {
            restrict: "EA",
            templateUrl: "issueArea.html",
            scope: { },
            controller: IssueAreaCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    IssueAreaCtrl.$inject = ["$element", "$timeout"];

    function IssueAreaCtrl($element, $timeout) {
        var vm = this,
            canvasColour = "rgba(0 ,0 ,0, 0)";

        var canvas = angular.element($element[0].querySelector('#issueAreaCanvas'));
        canvas.attr("width", $element[0].offsetWidth);
        canvas.attr("height", $element[0].offsetHeight);

        var myCanvas = document.getElementById("issueAreaCanvas");

        var mouse_drag_x = 0, mouse_drag_y = 0;
        var last_mouse_drag_x = -1, last_mouse_drag_y = -1;
        var mouse_button = 0;
        var mouse_dragging = false;

        var pen_col = "#FFFFFF";
        var pen_size = 1;
        var bg_col = "#000000";

        initCanvas(myCanvas);

        // redraw the canvas...
        var context = myCanvas.getContext("2d");
        context.fillStyle = canvasColour;
        context.fillRect(0, 0, myCanvas.width, myCanvas.height);
        context.lineCap = "round";

        // add event listeners
        function initCanvas(canvas)
        {
            // These offsets are needed because the element uses 'position:fixed'
            var layerXOffset = 1508,
                layerYOffset = 88;

            canvas.addEventListener('mousedown', function (evt) {
                switch(evt.button) {
                    case 0:  mouse_button = 1; break;	//left
                    case 1:  mouse_button = 4; break;	//middle
                    case 2:  mouse_button = 2; break;	//right
                    default: mouse_button = 0; break;
                }
                mouse_drag_x = evt.layerX + layerXOffset;
                mouse_drag_y = evt.layerY + layerYOffset;
                mouse_dragging = true;

                if (evt.shiftKey) { mouse_button = 1; }
                if (evt.ctrlKey)  { mouse_button = 4; }
                if (evt.altKey)   { mouse_button = 2; }

                updateImage(canvas);

                window.status='DOWN: '+evt.layerX+", "+evt.layerY;
                evt.preventDefault();
                evt.stopPropagation();
                evt.returnValue = false;
            }, false);

            canvas.addEventListener('mouseup', function (evt) {
                mouse_button = 0;
                mouse_dragging = false;
                last_mouse_drag_x = -1;
                last_mouse_drag_y = -1;

                updateImage(canvas);

                evt.preventDefault();
                evt.stopPropagation();
                evt.returnValue = false;
            }, false);

            canvas.addEventListener('mouseout', function (evt) {
                mouse_button = 0;
                mouse_dragging = false;
                last_mouse_drag_x = -1;
                last_mouse_drag_y = -1;

                updateImage(canvas);

                evt.preventDefault();
                evt.stopPropagation();
                evt.returnValue = false;
            }, false);

            canvas.addEventListener('mousemove', function (evt) {
                window.status='MOVE: '+evt.layerX+", "+evt.layerY;

                if (!mouse_dragging) {
                    return;
                }

                mouse_drag_x = evt.layerX + layerXOffset;
                mouse_drag_y = evt.layerY + layerYOffset;

                if (evt.shiftKey) { mouse_button = 1; }
                if (evt.ctrlKey)  { mouse_button = 4; }
                if (evt.altKey)   { mouse_button = 2; }

                updateImage(canvas);

                evt.preventDefault();
                evt.stopPropagation();
                evt.returnValue = false;
            }, false);
        }

        function updateImage(canvas)
        {
            var context = canvas.getContext("2d");

            if (!mouse_dragging)
                return;

            if (last_mouse_drag_x < 0 || last_mouse_drag_y < 0)
            {
                last_mouse_drag_x = mouse_drag_x;
                last_mouse_drag_y = mouse_drag_y;
                return;
            }

            // redraw the canvas...
            context.lineWidth = pen_size;

            context.beginPath();
            context.strokeStyle = pen_col;

            // Draw a line
            context.moveTo(last_mouse_drag_x, last_mouse_drag_y);
            context.lineTo(mouse_drag_x, mouse_drag_y);
            context.stroke();

            last_mouse_drag_x = mouse_drag_x;
            last_mouse_drag_y = mouse_drag_y;
        }

        vm.setupPin = function () {
            vm.buttonPinClass = "md-hue-2";
            vm.buttonDrawClass = "default";
        };

        vm.erase = function () {
            vm.buttonPinClass = "default";
            vm.buttonDrawClass = "default";

            // redraw the canvas...
            var context = myCanvas.getContext("2d");
            context.clearRect(0, 0, myCanvas.width, myCanvas.height);
            context.fillStyle = canvasColour;
            context.fillRect(0, 0, myCanvas.width, myCanvas.height);

            context.lineWidth = 1.0;
            context.lineCap = "round";
        };

        vm.setupDraw = function () {
            vm.buttonPinClass = "default";
            vm.buttonDrawClass = "md-hue-2";
        };
    }
}());