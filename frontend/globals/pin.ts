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

import { UnityUtil } from "./unity-util"

export class Pin {

	id: number;
	position: string;
	highlighted: boolean;
	norm;
	colours
	viewpoint;
	account;
	model;

	static pinColours = {
		blue : [12/255, 47/255, 84/255], // [0, 69/255, 148/255],
		yellow : [255/255, 255/255, 54/255]
	};

	pinHeadIsHighlighted;
	ghostPinHeadIsHighlighted;
	coneIsHighlighted;
	ghostConeIsHighlighted;
	pinHeadDepth;
	coneDepth;
	

	constructor(
		id: number, position: string, norm, colours, viewpoint, 
		account: string, model: string
	) {

		this.id = id;

		this.highlighted = false;
		this.viewpoint = viewpoint;
		this.account = account;
		this.model = model;
		UnityUtil.dropPin(id, position, norm, colours);
		
	};

	remove(id) {
		UnityUtil.removePin(id);
	};

	changeColour(colours) {
		UnityUtil.changePinColour(this.id, colours);
	};

	highlight() {

		this.highlighted = !this.highlighted;

		var depthMode = this.highlighted ? "ALWAYS" : "LESS" ;
		var highlighted = this.highlighted.toString();

		this.pinHeadIsHighlighted.setAttribute("value", highlighted);
		this.ghostPinHeadIsHighlighted.setAttribute("value", highlighted);
		this.coneIsHighlighted.setAttribute("value", highlighted);
		this.ghostConeIsHighlighted.setAttribute("value", highlighted);

		this.pinHeadDepth.setAttribute("depthFunc", depthMode);
		this.coneDepth.setAttribute("depthFunc", depthMode);
	};

	

}