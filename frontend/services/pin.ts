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
import { UnityUtil } from '../globals/unity-util';
import { PIN_COLORS } from '../styles';

export class Pin {
	public id: number;
	public type: string;
	public position: string;
	public highlighted: boolean;
	public norm;
	public colours;
	public viewpoint;
	public account;
	public model;
	public pinColours = PIN_COLORS;

	public pinHeadIsHighlighted;
	public ghostPinHeadIsHighlighted;
	public coneIsHighlighted;
	public ghostConeIsHighlighted;
	public pinHeadDepth;
	public coneDepth;

	constructor(
		id: number, type: string,  position: string, norm, colors, viewpoint,
		account: string, model: string
	) {

		this.id = id;
		this.type = type;
		this.highlighted = false;
		this.viewpoint = viewpoint;
		this.account = account;
		this.model = model;
		UnityUtil.dropPin(id, type, position, norm, colors);
	}

	public remove(id) {
		UnityUtil.removePin(id);
	}

	public changeColor(colors) {
		UnityUtil.changePinColour(this.id, colors);
	}

	public highlight() {
		this.highlighted = !this.highlighted;

		const depthMode = this.highlighted ? 'ALWAYS' : 'LESS' ;
		const highlighted = this.highlighted.toString();

		this.pinHeadIsHighlighted.setAttribute('value', highlighted);
		this.ghostPinHeadIsHighlighted.setAttribute('value', highlighted);
		this.coneIsHighlighted.setAttribute('value', highlighted);
		this.ghostConeIsHighlighted.setAttribute('value', highlighted);

		this.pinHeadDepth.setAttribute('depthFunc', depthMode);
		this.coneDepth.setAttribute('depthFunc', depthMode);
	}
}
