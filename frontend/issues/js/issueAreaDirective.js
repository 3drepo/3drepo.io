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
            scope: {
                data: "="
            },
            controller: IssueAreaCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    IssueAreaCtrl.$inject = ["$scope", "$element", "$window", "$timeout", "EventService"];

    function IssueAreaCtrl($scope, $element, $window, $timeout, EventService) {
        var vm = this,
            canvas,
            canvasColour = "rgba(0 ,0 ,0, 0)",
            myCanvas,
            penIndicator,
            mouse_drag_x = 0, mouse_drag_y = 0,
            last_mouse_drag_x = -1, last_mouse_drag_y = -1,
            mouse_button = 0,
            mouse_dragging = false,
            pen_col = "#FF0000",
            initialPenSize = 4,
            pen_size = initialPenSize,
            initialPenIndicatorSize = 20,
            penIndicatorSize = initialPenIndicatorSize,
            mouseWheelDirectionUp = null;

        /*
         * Init
         */
        $timeout(function () {
            canvas = angular.element($element[0].querySelector('#issueAreaCanvas'));
            myCanvas = document.getElementById("issueAreaCanvas");
            penIndicator = angular.element($element[0].querySelector("#issueAreaPenIndicator"));
            vm.buttonDrawClass = "md-hue-2";
            vm.pointerEvents = "auto";
            vm.drawMode = true;
            vm.showPenIndicator = false;
            vm.scribble = "/public/images/scribble_test.png";
            canvas.css("background", "rgba(255, 255, 255, 0.1");
            resizeCanvas();
            initCanvas(myCanvas);
            //document.getElementById("dl").addEventListener('click', dlCanvas, false);
        });

        /*
         * Setup event watch
         */
        $scope.$watch(EventService.currentEvent, function(event) {
            if (event.type === EventService.EVENT.SET_ISSUE_AREA_MODE) {
                if (event.value === "scribble") {
                    setupScribble();
                }
                else if (event.value === "erase") {
                    setupErase();
                }
                else if (event.value === "pin") {
                    setupPin();
                }
            }
        });

        /**
         * Make the canvas the same size as the area
         */
        function resizeCanvas () {
            canvas.attr("width", $element[0].offsetWidth);
            canvas.attr("height", $element[0].offsetHeight);
        }

        /**
         * Setup canvas and event listeners
         * 
         * @param canvas
         */
        function initCanvas(canvas)
        {
            // These offsets are needed because the element uses 'position:fixed'
            clearCanvas();

            canvas.addEventListener('mousedown', function (evt) {
                mouse_drag_x = evt.layerX;
                mouse_drag_y = evt.layerY;
                mouse_dragging = true;

                updateImage(canvas);

                window.status='DOWN: '+evt.layerX+", "+evt.layerY;
                evt.preventDefault();
                evt.stopPropagation();
                evt.returnValue = false;

                EventService.send(EventService.EVENT.TOGGLE_SCRIBBLE, {on: true});
                vm.pointerEvents = "none";
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

                EventService.send(EventService.EVENT.TOGGLE_SCRIBBLE, {on: false});
                vm.pointerEvents = "auto";
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

                EventService.send(EventService.EVENT.TOGGLE_SCRIBBLE, {on: false});
                vm.pointerEvents = "auto";
            }, false);

            canvas.addEventListener('mousemove', function (evt) {
                window.status='MOVE: ' + evt.layerX + ", " + evt.layerY;
                mouse_drag_x = evt.layerX;
                mouse_drag_y = evt.layerY;

                if (!mouse_dragging && !vm.showPenIndicator) {
                    $timeout(function () {
                        vm.showPenIndicator = true;
                    })
                }
                else {
                    updateImage(canvas);
                }

                evt.preventDefault();
                evt.stopPropagation();
                evt.returnValue = false;
                setPenIndicatorPosition(mouse_drag_x, mouse_drag_y);
            }, false);

            canvas.addEventListener('wheel', function (evt) {
                var penToIndicatorRation = 0.7;

                if (evt.deltaY === 0) {
                    mouseWheelDirectionUp = null;
                    initialPenIndicatorSize = penIndicatorSize;
                    initialPenSize = pen_size;
                }
                else if ((evt.deltaY === 1) && (mouseWheelDirectionUp === null)) {
                    mouseWheelDirectionUp = false;
                    penIndicatorSize = initialPenIndicatorSize;
                    pen_size = initialPenSize;
                }
                else if ((evt.deltaY === -1) && (mouseWheelDirectionUp === null)) {
                    mouseWheelDirectionUp = true;
                    penIndicatorSize = initialPenIndicatorSize;
                    pen_size = initialPenSize;
                }
                else {
                    penIndicatorSize += mouseWheelDirectionUp ? 1 : -1;
                    penIndicatorSize = (penIndicatorSize < 0) ? 0 : penIndicatorSize;
                    penIndicator.css("font-size", penIndicatorSize + "px");
                    setPenIndicatorPosition(evt.layerX, evt.layerY);

                    pen_size += mouseWheelDirectionUp ? penToIndicatorRation : -penToIndicatorRation;
                    pen_size = (pen_size < 0) ? 0 : pen_size;
                }
            }, false);
        }

        /**
         * Update the canvas
         * 
         * @param canvas
         */
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

            // Draw line
            context.beginPath();
            context.strokeStyle = pen_col;
            context.moveTo(last_mouse_drag_x, last_mouse_drag_y);
            context.lineTo(mouse_drag_x, mouse_drag_y);
            context.stroke();

            last_mouse_drag_x = mouse_drag_x;
            last_mouse_drag_y = mouse_drag_y;
        }

        /**
         * Clear the canvas
         */
        function clearCanvas () {
            var context = myCanvas.getContext("2d");
            context.clearRect(0, 0, myCanvas.width, myCanvas.height);
            context.fillStyle = canvasColour;
            context.fillRect(0, 0, myCanvas.width, myCanvas.height);
            context.lineCap = "round";
        }

        /**
         * Set up placing of the pin
         */
        function setupPin () {
            vm.buttonPinClass = "md-hue-2";
            vm.buttonDrawClass = "default";
            vm.buttonEraseClass = "default";
            vm.drawMode = false;
            canvas.css("background", "rgba(255, 255, 255, 0.0");
        };

        /**
         * Erase the canvas
         */
        function setupErase () {
            vm.buttonPinClass = "default";
            vm.buttonDrawClass = "default";
            vm.buttonEraseClass = "md-hue-2";
            vm.drawMode = true;
            canvas.css("background", "rgba(255, 255, 255, 0.1)");
            //clearCanvas();
            var context = myCanvas.getContext("2d");
            context.globalCompositeOperation = "destination-out";
            pen_col = "rgba(0, 0, 0, 1)";
        };

        /**
         * Set up drawing
         */
        function setupScribble () {
            vm.buttonPinClass = "default";
            vm.buttonDrawClass = "md-hue-2";
            vm.buttonEraseClass = "default";
            vm.drawMode = true;
            canvas.css("background", "rgba(255, 255, 255, 0.1)");
            var context = myCanvas.getContext("2d");
            context.globalCompositeOperation = "source-over";
            pen_col = "#FF0000";
        };

        /*
         * Watch for screen resize
         */
        angular.element($window).bind("resize", function() {
            //resizeCanvas();
        });

        function dlCanvas() {
            var dt = myCanvas.toDataURL('image/png');
            /* Change MIME type to trick the browser to downlaod the file instead of displaying it */
            dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');

            /* In addition to <a>'s "download" attribute, you can define HTTP-style headers */
            dt = dt.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=Canvas.png');

            this.href = dt;
        }

        /**
         * Move the pen indicator
         * @param x
         * @param y
         */
        function setPenIndicatorPosition (x, y) {
            var positionFactor = 2.2;
            penIndicator.css("left", (x - (penIndicatorSize / positionFactor)) + "px");
            penIndicator.css("top", (y - (penIndicatorSize / positionFactor)) + "px");
        }
    }
}());