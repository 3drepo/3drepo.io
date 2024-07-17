/**
 *  Copyright (C) 2024 3D Repo Ltd
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
 * Allows snapping to an SVG based on path primitives
 */
export class SVGSnap {

	container: HTMLElement;

	svg: SVGSVGElement;

	constructor() {
		this.container = document.createElement('div');
		console.log('creating snap handler');
	}

	async load(src: string) {
		const res = await fetch(src);
		const text = await res.text();
		this.container.innerHTML = text;
		this.initialise();
	}

	initialise() {
		this.svg = this.container.querySelector('svg') as SVGSVGElement;

		// Extract all the Path elements. The responses here should include
		// all basic shapes, which derive from Path.

		const paths = this.svg.querySelectorAll<SVGPathElement>('path:not([stroke=\'none\'])');

	}

	snap(ev: { x: number, y: number }) {

	}
}

