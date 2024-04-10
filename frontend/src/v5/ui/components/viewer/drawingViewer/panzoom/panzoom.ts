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

import { animate } from './animate';
import EventEmitter from 'eventemitter3';
import BezierEasing from 'bezier-easing';

const inertiaFunction = BezierEasing(0, 0.33, 0.66, 1);

export const Events = {
	transform: 'transform',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const panzoom = (target: HTMLElement | SVGElement, options) => {
	const transform = { scale:1, x: 0, y: 0 };
	const zoomStep = 0.2;
	target.style.transformOrigin = '0 0';
	target.style.userSelect = 'none';
	target.setAttribute('draggable', 'false');
	const container = target.parentElement;
	const emitter = new EventEmitter();

	let animation = null;

	const isSVG = target.tagName.toLowerCase() === 'svg';

	const speed = { x:0, y: 0 };

	const minZoom = options.minZoom || 0.5;
	const maxZoom = options.maxZoom || 10;

	const stopInertia = () => {
		speed.x = 0;
		speed.y = 0;
		
		animation?.cancel();
	};

	const applyTransform = () => {
		const { scale, x, y } = transform;

		if (isSVG) {
			target.setAttribute('transform', `matrix(${scale} 0 0 ${scale} ${x} ${y})`);
		} else {
			target.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${x}, ${y})`;
		}
	};

	const moveTo = (x: number, y: number) => {
		if (x === transform.x && transform.y === y ) return;

		transform.x = x;
		transform.y = y;
		
		applyTransform();
	};

	const zoomTo = (x: number, y: number, newScale: number) => {
		const originalRect = target.getBoundingClientRect();
		const relativeX = x - originalRect.x;
		const relativeY = y - originalRect.y;

		const scale = Math.max(Math.min(newScale, maxZoom), minZoom);
		const scaleChange = scale / transform.scale;
		const newPos = { x: transform.x + relativeX * (1 - scaleChange), y: transform.y + relativeY * ( 1 - scaleChange) };
		transform.scale = scale;
		moveTo(newPos.x, newPos.y);
		emitter.emit(Events.transform);
	};

	const smoothZoom = (x:number, y:number, scaleFactor: number) => {
		stopInertia();

		const initialScale = transform.scale;
		const diffScale =  transform.scale * scaleFactor - initialScale;

		const t = 200;

		animation = animate((currentTime) => {
			const progress = inertiaFunction(currentTime / t);
			zoomTo(x, y, initialScale + progress * diffScale );
			return currentTime >= t;
		});
	};

	const onWheel = (ev: WheelEvent) => {
		stopInertia();
		const newScale = transform.scale * (1 + zoomStep * -Math.sign(ev.deltaY));
		zoomTo(ev.clientX, ev.clientY, newScale);
	};

	const onMouseMove = (ev: MouseEvent) => {
		speed.x = ev.movementX * 10;
		speed.y = ev.movementY * 10;
		
		moveTo(transform.x + ev.movementX, transform.y + ev.movementY);
		emitter.emit(Events.transform);
	};

	const onMouseDown = () => {
		stopInertia();
		container.addEventListener('mousemove', onMouseMove);
	};

	const onMouseUp = () => {
		container.removeEventListener('mousemove', onMouseMove);

		const acc = 9.8;

		const t =  ((((speed.x ** 2 + speed.y ** 2) **  0.5) / acc) / 10 ) * 1000;

		if (t) {
			const acc2 =  acc * 2;
			
			const initialPos = { ...transform };

			const diffPos =  {
				x: speed.x ** 2  * Math.sign(speed.x) / acc2,
				y: speed.y ** 2  * Math.sign(speed.y) / acc2,
			};


			speed.x = 0;
			speed.y = 0;

			animation = animate((currentTime) => {
				const progress = inertiaFunction(currentTime / t);
				moveTo(initialPos.x + diffPos.x * progress, initialPos.y + diffPos.y * progress);
				emitter.emit(Events.transform);
				return currentTime >= t;
			});
	
		}
	};

	const subscribeToEvents = () => {
		container.addEventListener('wheel', onWheel);
		container.addEventListener('mousedown', onMouseDown);
		container.addEventListener('mouseup', onMouseUp);
		container.addEventListener('mouseleave', onMouseUp);

	};

	const unSubscribeToEvents = () => {
		container.removeEventListener('wheel', onWheel);
		container.removeEventListener('mousemove', onMouseDown);
		container.removeEventListener('mousedown', onMouseMove);
		container.removeEventListener('mouseup', onMouseUp);
		container.removeEventListener('mouseleave', onMouseUp);
	};

	const dispose = () => {
		stopInertia();
		unSubscribeToEvents();
	};
	
	subscribeToEvents();
	const getTransform = () => transform;

	return { 
		getTransform, 
		dispose, 
		on: (event, fn) => {
			emitter.on(event, fn);
			emitter.emit(Events.transform);
		},
		smoothZoom,
		moveTo,
	};
};

export type PanZoom = ReturnType<typeof panzoom>;

