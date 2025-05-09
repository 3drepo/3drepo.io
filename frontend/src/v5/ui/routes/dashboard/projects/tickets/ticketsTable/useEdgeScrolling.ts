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

import { useRef } from 'react';

type EdgeScrolling = {
	listen: (container: HTMLElement) => void;
	stop: () => void;
	isRunning: () => boolean;
};
type Options = {
	edgeSize?: number,
	speed?: number,
	refreshRate?: number
};
export const edgeScrolling = (options: Options = {}): EdgeScrolling => {
	const { edgeSize = 150, speed = 2 } = options;
	let running = false;
	let scrollValue = 0;
	let containerElement: HTMLElement | null = null;
		
	const getScrollValueByMousePosition = (event) => {
		const mouseXPositionInViewport = event.clientX;
		const viewportWidth = containerElement.clientWidth;
	
		const edgeLeft = edgeSize;
		const edgeRight = viewportWidth - edgeSize;
		const mouseInLeftEdge = mouseXPositionInViewport < edgeLeft;
		const mouseInRightEdge = mouseXPositionInViewport > edgeRight;
	
		if (!mouseInLeftEdge && !mouseInRightEdge) return 0;

		const containerWidth = Math.max(
			containerElement.scrollWidth,
			containerElement.offsetWidth,
			containerElement.clientWidth,
		);
	
		const maxScrollLeft = containerWidth - viewportWidth;
		const currentScrollLeft = containerElement.scrollLeft;
		const canScrollLeft = currentScrollLeft > 0;
		const canScrollRight = currentScrollLeft < maxScrollLeft;
		let intensity = 0;

		if (mouseInLeftEdge && canScrollLeft) {
			intensity = mouseXPositionInViewport - edgeLeft;
		} else if (mouseInRightEdge && canScrollRight) {
			intensity = mouseXPositionInViewport - edgeRight;
		}
		return speed * (intensity ** 2) * Math.sign(intensity) / edgeSize;
	};

	const handleMouseMove = (event) => {
		scrollValue = getScrollValueByMousePosition(event);
	};

	const scroll = () => {
		if (!running) return;
		if (scrollValue !== 0) {
			const maxScrollLeft = containerElement.scrollWidth - containerElement.clientWidth;
			const currentScrollLeft = containerElement.scrollLeft;
	
			let newScrollLeft = currentScrollLeft + scrollValue;
			newScrollLeft = Math.max(0, Math.min(newScrollLeft, maxScrollLeft));
			const delta = newScrollLeft - currentScrollLeft;
	
			containerElement.scrollBy({ left: delta, behavior: 'auto' });
		}
	
		requestAnimationFrame(scroll);
	};

	const listen = (container: HTMLElement) => {
		console.log('listne');
		containerElement = container;
		running = true;
		containerElement.addEventListener('mousemove', handleMouseMove, false);
		scroll();
	};

	const stop = () => {
		console.log('stop');
		if (!containerElement) return;
		running = false;
		containerElement.removeEventListener('mousemove', handleMouseMove);
		containerElement = null;
	};

	return { listen, stop, isRunning: () => running };
};

export const useEdgeScrolling = (options?: Options) => {
	const ref = useRef<EdgeScrolling>(edgeScrolling(options));
	return ref.current;
};