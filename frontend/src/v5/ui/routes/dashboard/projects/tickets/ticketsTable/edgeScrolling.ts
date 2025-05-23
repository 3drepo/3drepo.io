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
import { EdgeHoveringData, EdgeHoveringObserver } from './edgeHoveringObserver';
import { throttle } from 'lodash';

type EdgeScrolling = {
	start: (container: HTMLElement) => void;
	stop: () => void;
	isRunning: boolean;
};
type Options = {
	edgeSize?: number,
	speed?: number,
	throttleTime?: number,
};
export const edgeScrolling = (options: Options = {}): EdgeScrolling => {
	const { speed = 50, throttleTime = 20 } = options;
	let scrollSpeed = 0;
	let containerElement: HTMLElement | null = null;
	let observer = new EdgeHoveringObserver();

	const handleMouseMove = ({ side, proximity }: EdgeHoveringData) => {
		scrollSpeed = ((proximity / 100) ** 3) * speed;
		if (side === 'left') {
			scrollSpeed *= -1;
		}
	};

	// Throttled scroll logic
	const scrollContainer = () => {
		if (!observer.isObserving || !containerElement) return;

		if (scrollSpeed !== 0) {
			containerElement.scrollLeft += scrollSpeed;
		}
	};

	const throttledScroll = throttle(
		scrollContainer,
		throttleTime,
		{ leading: true, trailing: true },
	);

	const scrollLoop = () => {
		if (!observer.isObserving) return;
		throttledScroll();
		requestAnimationFrame(scrollLoop);
	};

	const start = (container: HTMLElement) => {
		containerElement = container;
		observer.observe(container, handleMouseMove, options.edgeSize);
		scrollLoop();
	};

	return {
		start,
		stop: observer.unobserve,
		isRunning: observer.isObserving,
	};
};

export const useEdgeScrolling = (options?: Options) => {
	const ref = useRef<EdgeScrolling>(edgeScrolling(options));
	return ref.current;
};