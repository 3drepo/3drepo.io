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
import { UnityUtil } from '../../globals/unity-util';

interface IPinConstructor {
	id: string;
	type: string;
	position: [number];
	norm: [number];
	colors: [number];
	account: string;
	model: string;
}

export class Pin {
	public id: string;
	public highlighted: boolean;

	public pinHeadIsHighlighted;
	public ghostPinHeadIsHighlighted;
	public coneIsHighlighted;
	public ghostConeIsHighlighted;
	public pinHeadDepth;
	public coneDepth;

	constructor({
		id, type, position, norm, colors, account, model,
	}: IPinConstructor) {
		this.id = id;
		this.highlighted = false;

		if (type === 'risk') {
			UnityUtil.dropRiskPin(id, position, norm, colors);
		} else {
			UnityUtil.dropIssuePin(id, position, norm, colors);
		}

	}

	public remove() {
		UnityUtil.removePin(this.id);
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
