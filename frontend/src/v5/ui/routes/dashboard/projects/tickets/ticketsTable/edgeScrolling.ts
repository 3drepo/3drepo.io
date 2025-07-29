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

type EdgeScrolling = {
	start: (container: HTMLElement) => void;
	stop: () => void;
	isRunning: boolean;
};
type Options = {
	edgeSize?: number,
	speed?: number,
};
export const edgeScrolling = (options: Options = {}): EdgeScrolling => {
	const { speed = 1000 } = options;
	let scrollSpeed = 0;
	let containerElement: HTMLElement | null = null;
	const observer = new EdgeHoveringObserver();
	let prevTime = null;

	const handleMouseMove = ({ side, proximity }: EdgeHoveringData) => {
		scrollSpeed = ((proximity / 100) ** 3) * speed;
		if (side === 'left') {
			scrollSpeed *= -1;
		}
	};

	const scrollContainer = () => {
		if (!observer.isObserving || !containerElement) return;

		const now = new Date().getTime();
		if (prevTime && scrollSpeed !== 0) {
			const timeDiff = now - prevTime;
			const incrementX = scrollSpeed * (timeDiff / 1000);
			containerElement.scrollLeft += incrementX;
		}
		prevTime = now;

		requestAnimationFrame(scrollContainer);
	};

	const start = (container: HTMLElement) => {
		containerElement = container;
		observer.observe(container, handleMouseMove, options.edgeSize);
		scrollContainer();
	};

	const stop = () => {
		scrollSpeed = 0;
		containerElement = null;
		observer.unobserve();
		prevTime = null;
	};

	return {
		start,
		stop,
		isRunning: observer.isObserving,
	};
};

export const useEdgeScrolling = (options?: Options) => {
	const ref = useRef<EdgeScrolling>(edgeScrolling(options));
	return ref.current;
};