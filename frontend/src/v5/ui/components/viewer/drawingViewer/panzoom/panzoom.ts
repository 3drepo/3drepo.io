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
import { ZoomableImage } from '../drawingViewerImage/drawingViewerImage.component';

const inertiaFunction = BezierEasing(0, 0.33, 0.66, 1);
const zoomEasing = BezierEasing(0, 1.02, 0.65, 1);
export const Events = {
	transform: 'transform',
	startDrag: 'startDrag',
	endDrag: 'endDrag',
};

const millisecondsPerSecond = 1000;
const acc = 9.8;
const mass = 10;
const zoomDuration = 300;

/* eslint-disable @typescript-eslint/no-use-before-define */
export const panzoom = (target: ZoomableImage, options) => {
	const transform = { scale:1, x: 0, y: 0 };
	const zoomStep = 0.2;

	const container = target.getEventsEmitter();
	const emitter = new EventEmitter();

	let prevContainerRect = container.getBoundingClientRect();

	let animation = null;

	const speed = { x:0, y: 0 };

	let minZoom = options.minZoom || 0.5;
	let maxZoom = options.maxZoom || 10;

	const keepCenter = () => {
		const rect =  container.getBoundingClientRect();
		const diff = { diffX: rect.width - prevContainerRect.width, diffY: rect.height - prevContainerRect.height };

		prevContainerRect = rect;
		moveTo(transform.x + (diff.diffX / 2), transform.y + (diff.diffY / 2) );
		emitter.emit(Events.transform);
	};

	const resizeObserver = new ResizeObserver(keepCenter);
	resizeObserver.observe(container);

	const stopInertia = () => {
		speed.x = 0;
		speed.y = 0;
		
		animation?.cancel();
	};

	const applyTransform = () => {
		target.setTransform(transform);
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
				
		animation = animate((currentTime) => {
			const progress = zoomEasing(currentTime / zoomDuration);
			zoomTo(x, y, initialScale + progress * diffScale );
			return currentTime >= zoomDuration;
		});
	};

	const zoom = (scaleFactor, smooth:boolean = true) => {
		const contRect = container.getBoundingClientRect();
		const pos = { x :contRect.width / 2 - contRect.x,  y: contRect.height / 2 + contRect.y };

		if (smooth) smoothZoom(pos.x, pos.y, scaleFactor);
		else zoomTo(pos.x, pos.y, transform.scale * scaleFactor);
	};

	const setMinZoom = (mZoom) => {
		if (transform.scale < mZoom) {
			zoom(transform.scale * mZoom);
		} 

		minZoom = mZoom;
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
		container.style.cursor = 'grabbing';
	};

	const onMouseUp = () => {
		container.removeEventListener('mousemove', onMouseMove);
		container.style.cursor = 'default';

		const duration =  (((speed.x ** 2 + speed.y ** 2) **  0.5) * millisecondsPerSecond) / (acc * mass ) ;

		if (duration) {
			const acc2 =  acc * 2;
			
			const initialPos = { ...transform };

			const diffPos =  {
				x: speed.x ** 2  * Math.sign(speed.x) / acc2,
				y: speed.y ** 2  * Math.sign(speed.y) / acc2,
			};


			speed.x = 0;
			speed.y = 0;

			animation = animate((currentTime) => {
				const progress = inertiaFunction(currentTime / duration);
				moveTo(initialPos.x + diffPos.x * progress, initialPos.y + diffPos.y * progress);
				emitter.emit(Events.transform);
				return currentTime >= duration;
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
		container.removeEventListener('mousemove', onMouseMove);
		container.removeEventListener('mousedown', onMouseDown);
		container.removeEventListener('mouseup', onMouseUp);
		container.removeEventListener('mouseleave', onMouseUp);
	};

	const dispose = () => {
		stopInertia();
		resizeObserver.disconnect();
		emitter.removeAllListeners();
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
		setMinZoom,
		getMinZoom: () => minZoom,
		getMaxZoom: () => maxZoom,
		zoom,
	};
};

export type PanZoom = ReturnType<typeof panzoom>;

