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

/**
 * Created by Timo on 16.06.2014.
 */
var ClipPlane = function ( scope, proxyParent, runtime )
{
    var _axis = "X";

    var _scope = scope;

    var _clipPlane = null;

    var _color = "1 1 1";

    var _volume = null;

    var _clipping = -1;

	var _normal = new x3dom.fields.SFVec3f(_clipping, 0, 0);

	var _angle = 0;

	var _distance = 0;

    var _proxyTransform = null;

    var _proxyCoordinates = null;

    var _proxyParent = proxyParent;

    var _runtime = runtime;

    var initialize = function ()
    {
        updateVolume();
        createProxy();
        createClipPlane();
    };

    this.Move = function ( value )
    {
        if ( _axis == "X" )
        {
            _distance = ((_volume.max.x - _volume.min.x) * value) + _volume.min.x;
        }
        else if ( _axis == "Y" )
        {
            _distance = ((_volume.max.y - _volume.min.y) * value) + _volume.min.y;
        }
        else if ( _axis == "Z" )
        {
            _distance = ((_volume.max.z - _volume.min.z) * value) + _volume.min.z;
        }

		updateClipPlane();
		updateProxy();
    };

	this.Rotate = function ( value )
    {
		var rotMat;

		_angle += value;

        if ( _axis == "X" )
        {
            // Convert the value to a rotation Matrix
			rotMat = x3dom.fields.SFMatrix4f.rotationY( value );

			// Rotate the normal
			_normal = rotMat.multMatrixPnt( _normal );
        }
        else if ( _axis == "Y" )
        {
            // Convert the value to a rotation Matrix
			rotMat = x3dom.fields.SFMatrix4f.rotationZ( value );

			// Rotate the normal
			_normal = rotMat.multMatrixPnt( _normal );
        }
        else if ( _axis == "Z" )
        {
            // Convert the value to a rotation Matrix
			rotMat = x3dom.fields.SFMatrix4f.rotationX( value );

			// Rotate the normal
			_normal = rotMat.multMatrixPnt( _normal );
        }

		updateClipPlane();
		updateProxy();

    };

    this.Axis = function ( axis )
    {
        _axis = axis;

		_angle = 0;

		_distance = 0;

		if ( _axis == "X" )
        {
            _normal = new x3dom.fields.SFVec3f(_clipping, 0, 0);
        }
        else if ( _axis == "Y" )
        {
            _normal = new x3dom.fields.SFVec3f(0, _clipping, 0);

        }
        else if ( _axis == "Z" )
        {
            _normal = new x3dom.fields.SFVec3f(0, 0, _clipping);
        }

		updateProxy();
        updateClipPlane();
        updateProxyCoordinates();
    };

    this.Clipping = function ( clipping )
    {
        _clipping = clipping;

		_angle = 0;

		_distance = 0;

		if ( _axis == "X" )
        {
            _normal = new x3dom.fields.SFVec3f(_clipping, 0, 0);
        }
        else if ( _axis == "Y" )
        {
            _normal = new x3dom.fields.SFVec3f(0, _clipping, 0);

        }
        else if ( _axis == "Z" )
        {
            _normal = new x3dom.fields.SFVec3f(0, 0, _clipping);
        }

		updateProxy();
        updateClipPlane();
    };

    var updateVolume = function ()
    {
        _volume = _runtime.getBBox( _scope );
    };

    var updateClipPlane = function ()
    {
        if ( _axis == "X" )
        {
            //_clipPlane.setAttribute("plane", _clipping + " 0 0 0");
			_clipPlane.setAttribute("plane", _normal.x + " " + _normal.y + " " + _normal.z + " " + _distance);
        }
        else if ( _axis == "Y" )
        {
            //_clipPlane.setAttribute("plane", "0 " + _clipping + " 0 0");
			_clipPlane.setAttribute("plane", _normal.x + " " + _normal.y + " " + _normal.z + " " + _distance);

        }
        else if ( _axis == "Z" )
        {
            //_clipPlane.setAttribute("plane", "0 0 " + _clipping + " 0");
			_clipPlane.setAttribute("plane", _normal.x + " " + _normal.y + " " + _normal.z + " " + _distance);
        }
    };

	var updateProxy = function ()
    {

		if ( _axis == "X" )
        {
            _proxyTransform.setAttribute("translation", -_distance * _clipping + " 0 0");
			_proxyTransform.setAttribute("rotation", "0 1 0 " + _angle );
        }
        else if ( _axis == "Y" )
        {
			_proxyTransform.setAttribute("translation", "0 " + -_distance  * _clipping + " 0");
			_proxyTransform.setAttribute("rotation", "0 0 1 " + _angle );
        }
        else if ( _axis == "Z" )
        {
            _proxyTransform.setAttribute("translation", "0 0 " + -_distance * _clipping);
			_proxyTransform.setAttribute("rotation", "1 0 0 " + _angle );
        }

    };

    var updateProxyCoordinates = function ()
    {
        var p0, p1, p2, p3, p4;

        if ( _axis == "X")
        {
            p0 = "0 " + _volume.max.y + " " + _volume.min.z + ", ";
            p1 = "0 " + _volume.min.y + " " + _volume.min.z + ", ";
            p2 = "0 " + _volume.min.y + " " + _volume.max.z + ", ";
            p3 = "0 " + _volume.max.y + " " + _volume.max.z + ", ";
            p4 = "0 " + _volume.max.y + " " + _volume.min.z;

            _proxyCoordinates.setAttribute("point", p0 + p1 + p2 + p3 + p4);
        }
        else if ( _axis == "Y" )
        {
            p0 = _volume.min.x + " 0 " + _volume.max.z + ", ";
            p1 = _volume.min.x + " 0 " + _volume.min.z + ", ";
            p2 = _volume.max.x + " 0 " + _volume.min.z + ", ";
            p3 = _volume.max.x + " 0 " + _volume.max.z + ", ";
            p4 = _volume.min.x + " 0 " + _volume.max.z;

            _proxyCoordinates.setAttribute("point", p0 + p1 + p2 + p3 + p4);
        }
        else if ( _axis == "Z" )
        {
            p0 = _volume.min.x + " " + _volume.max.y + " 0, ";
            p1 = _volume.min.x + " " + _volume.min.y + " 0, ";
            p2 = _volume.max.x + " " + _volume.min.y + " 0, ";
            p3 = _volume.max.x + " " + _volume.max.y + " 0, ";
            p4 = _volume.min.x + " " + _volume.max.y + " 0";

            _proxyCoordinates.setAttribute("point", p0 + p1 + p2 + p3 + p4);
        }
    };

    var createClipPlane = function()
    {
        _clipPlane = document.createElement("ClipPlane");
        _clipPlane.setAttribute("plane", _clipping + " 0 0 0");
        _clipPlane.setAttribute("cappingStrength", "0.003");
        _clipPlane.setAttribute("cappingColor", _color);

        _scope.appendChild( _clipPlane );
    };

    var createProxy = function()
    {
        _proxyTransform = document.createElement("Transform");

        var shape = document.createElement("Shape");

        var app = document.createElement("Appearance");

        var mat = document.createElement("Material");
        mat.setAttribute("emissiveColor", _color);

        var line = document.createElement("LineSet");
        line.setAttribute("vertexCount", "5");

        _proxyCoordinates = document.createElement("Coordinate");

        updateProxyCoordinates( _axis );

        _proxyTransform.appendChild( shape );

        shape.appendChild( app );

        app.appendChild( mat );

        shape.appendChild( line );

        line.appendChild( _proxyCoordinates );

        _proxyParent.appendChild( _proxyTransform );
    };

    initialize();
};

angular.module('3drepo')
.controller('ClipCtrl', ['$scope', 'ViewerService', function($scope, ViewerService)
{
	$scope.clipPlane = null;
	$scope.slider = 0.5;

	$scope.pdf = {};

	$scope.addClipPlane = function()
	{
		$scope.clipPlane = new ClipPlane($("#model__root")[0], ViewerService.defaultViewer.getViewArea()._scene._xmlNode, ViewerService.defaultViewer.runtime);
	}

	$scope.changeAxis = function (axs)
	{
		if (!$scope.clipPlane)
			$scope.addClipPlane();

		$scope.clipPlane.Axis(axs);
	}

	$scope.$watch('slider', function() {
		if (!$scope.clipPlane)
			$scope.addClipPlane();

		$scope.clipPlane.Move($scope.slider / 1000);
	});

	$scope.openPDF = function(pdfURL) {
		$scope.pdfURL = pdfURL;

		var modalInstance = $modal.open({
			templateUrl: 'pdfviewer.html',
			controller: 'DialogCtrl',
			backdrop: false,
			size: 'lg',
			resolve: {
				params: function() {
					return {
						pdfURL: $scope.pdfURL
					};
				}
			}
		});
	}
}]);

