/**
 **  Copyright (C) 2014 3D Repo Ltd
 **
 **  This program is free software: you can redistribute it and/or modify
 **  it under the terms of the GNU Affero General Public License as
 **  published by the Free Software Foundation, either version 3 of the
 **  License, or (at your option) any later version.
 **
 **  This program is distributed in the hope that it will be useful,
 **  but WITHOUT ANY WARRANTY; without even the implied warranty of
 **  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 **  GNU Affero General Public License for more details.
 **
 **  You should have received a copy of the GNU Affero General Public License
 **  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

declare const UnityUtil;
export class Pin {

	public static pinColours = {
		blue: [12 / 255, 47 / 255, 84 / 255], //"#oc2f54", // [0, 69/255, 148/255],
		yellow: [255 / 255, 255 / 255, 54 / 255], //"#ffff36",
		red: [220 / 255, 20 / 255, 60 / 255], //"#dc143c",
		maroon: [128 / 255, 0, 0], //"#800000",
		crimson: [220 / 255, 20 / 255, 60 / 255], //"#dc143c",
		darkOrange: [255 / 255, 140 / 255, 0], //"#ff8c00",
		orange: [255 / 255, 165 / 255, 0], //"#ffa500",
		green: [0, 128 / 255, 0], //"#008000",
		medSeaGreen: [60 / 255, 179 / 255, 113 / 255], //"#3cb371",
		limeGreen: [50 / 255, 205 / 255, 50 / 255], //"#32cd32",
		lightGreen: [144 / 255, 238 / 255, 144 / 255], //"#90ee90",
		lemonChiffon: [255 / 255, 250 / 255, 205 / 255], //"#fffacd",
		lightYellow: [255 / 255, 255 / 255, 224 / 255] //"#ffffe0"
	};

	public id: number;
	public type: string;
	public position: string;
	public highlighted: boolean;
	public norm;
	public colours;
	public viewpoint;
	public account;
	public model;

	public pinHeadIsHighlighted;
	public ghostPinHeadIsHighlighted;
	public coneIsHighlighted;
	public ghostConeIsHighlighted;
	public pinHeadDepth;
	public coneDepth;

	constructor(
		id: number, type: string,  position: string, norm, colours, viewpoint,
		account: string, model: string
	) {

		this.id = id;
		this.type = type;

		this.highlighted = false;
		this.viewpoint = viewpoint;
		this.account = account;
		this.model = model;
		UnityUtil.dropPin(id, type, position, norm, colours);

	}

	public remove(id) {
		UnityUtil.removePin(id);
	}

	public changeColour(colours) {
		UnityUtil.changePinColour(this.id, colours);
	}

	public highlight() {

		this.highlighted = !this.highlighted;

		const depthMode = this.highlighted ? "ALWAYS" : "LESS" ;
		const highlighted = this.highlighted.toString();

		this.pinHeadIsHighlighted.setAttribute("value", highlighted);
		this.ghostPinHeadIsHighlighted.setAttribute("value", highlighted);
		this.coneIsHighlighted.setAttribute("value", highlighted);
		this.ghostConeIsHighlighted.setAttribute("value", highlighted);

		this.pinHeadDepth.setAttribute("depthFunc", depthMode);
		this.coneDepth.setAttribute("depthFunc", depthMode);
	}

}
