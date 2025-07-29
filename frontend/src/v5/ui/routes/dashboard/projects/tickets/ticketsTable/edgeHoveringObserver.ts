/**
 *  Copyright (C) 2025 3D Repo Ltd
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

export type EdgeHoveringData = {
	side?: 'left' | 'right',
	// proximity to container edge in percentage
	// e.g. on the left:
	// - 100 when the mouse is on the actual container edge
	// - 0 when the mouse is on the virtual edge (`edgeSize`px away from the actual edge) 
	proximity: number,
};
const NO_EDGE_HOVERING: EdgeHoveringData = { proximity: 0 };
export class EdgeHoveringObserver {
	private containerElement: HTMLElement;

	private onMouseMove: (data: EdgeHoveringData) => void;

	private edgeSize: number;

	private observing: boolean;

	public get isObserving() { return this.observing; }

	private getEdgeHoveringData = (event): EdgeHoveringData => {
		const mouseXPositionInViewport = event.clientX;
		const viewportWidth = this.containerElement.clientWidth;
	
		const edgeLeft = this.edgeSize;
		const edgeRight = viewportWidth - this.edgeSize;
		const mouseInLeftEdge = mouseXPositionInViewport < edgeLeft;
		const mouseInRightEdge = mouseXPositionInViewport > edgeRight;

		if (mouseInLeftEdge) return {
			proximity: (edgeLeft - mouseXPositionInViewport) / this.edgeSize * 100,
			side: 'left',
		};
		if (mouseInRightEdge) return {
			proximity: (mouseXPositionInViewport - edgeRight) / this.edgeSize * 100,
			side: 'right',
		};
		return NO_EDGE_HOVERING;
	};

	private handleMouseMove = (e) => this.onMouseMove(this.getEdgeHoveringData(e));

	public observe = (
		container: HTMLElement,
		onMouseMove: (data: EdgeHoveringData) => void,
		edgeSize = 100,
	) => {
		this.containerElement = container;
		this.onMouseMove = onMouseMove;
		this.edgeSize = edgeSize;
		this.observing = true;
		this.containerElement.addEventListener('mousemove', this.handleMouseMove, false);
	};

	public unobserve = () => {
		if (!this.observing) return;
		this.observing = false;
		this.containerElement.removeEventListener('mousemove', this.handleMouseMove);
	};
}
