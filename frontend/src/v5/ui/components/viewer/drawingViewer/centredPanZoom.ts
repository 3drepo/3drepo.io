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

import { aspectRatio } from '@/v4/helpers/aspectRatio';
import { noop } from 'lodash';
import { PanZoom, PanZoomOptions } from 'panzoom';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const panzoom = (target: HTMLElement | SVGElement, options) => {
	const transform = { scale:1, x: 0, y: 0 };
	const zoomStep = 0.2;
	target.style.transformOrigin = '0 0';
	target.style.userSelect = 'none';
	target.setAttribute('draggable', 'false');
	const container = target.parentElement;

	const speed = { x:0, y: 0 };
	
	const applyTransform = () => {
		const { scale, x, y } = transform;
		target.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${x}, ${y}`;
	};

	const zoomTo = (x: number, y: number, newScale: number) => {
		const originalRect = target.getBoundingClientRect();
		const relativeX =  x - originalRect.x;
		const relativeY = y - originalRect.y;

		const scaleChange = newScale / transform.scale;
		const newPos = { x: transform.x + relativeX * (1 - scaleChange), y: transform.y + relativeY * ( 1 - scaleChange) };

		transform.scale = newScale;
		transform.x = newPos.x;
		transform.y = newPos.y;
		
		speed.x = 0;
		speed.y = 0;
		applyTransform();
	};

	const smoothZoom = (x:number, y:number, scaleFactor: number) => {
		target.style.transition = '0.25s ease-in-out';
		zoomTo(x, y, transform.scale * scaleFactor);
	};

	const onWheel = (ev: WheelEvent) => {
		const newScale = transform.scale * (1 + zoomStep * -Math.sign(ev.deltaY));
		zoomTo(ev.clientX, ev.clientY, newScale);

		target.style.transition = 'none';
		applyTransform();
	};

	const onMouseMove = (ev: MouseEvent) => {
		transform.x += ev.movementX;
		transform.y += ev.movementY;

		speed.x = ev.movementX * 10;
		speed.y = ev.movementY * 10;

		applyTransform();
	};

	const onMouseDown = () => {
		const parentRect = container.getBoundingClientRect();
		const rect = target.getBoundingClientRect();

		transform.x = rect.x - parentRect.x;
		transform.y = rect.y - parentRect.y;

		speed.x = 0;
		speed.y = 0;

		target.style.transition = 'none';

		applyTransform();
		
		container.addEventListener('mousemove', onMouseMove);
	};

	const onMouseUp = () => {
		container.removeEventListener('mousemove', onMouseMove);

		const acc = 9.8;

		const t =  (((speed.x ** 2 + speed.y ** 2) **  0.5) / acc) / 10 ;

		if (t) {
			const acc2 =  acc * 2;
	
			transform.x += speed.x ** 2  * Math.sign(speed.x) / acc2;
			transform.y += speed.y ** 2  * Math.sign(speed.y) / acc2;
	
			target.style.transition = `all ${t}s cubic-bezier(0,.33,.66,1)`;
		} else {
			target.style.transition = 'none';
		}


		applyTransform();
	};

	const subscribeToEvents = () => {
		container.addEventListener('wheel', onWheel);
		container.addEventListener('mousedown', onMouseDown);
		container.addEventListener('mouseup', onMouseUp);
	};

	const unSubscribeToEvents = () => {
		container.removeEventListener('wheel', onWheel);
		container.removeEventListener('mousemove', onMouseDown);
		container.removeEventListener('mousedown', onMouseMove);
		container.removeEventListener('mouseup', onMouseUp);
	};

	subscribeToEvents();

	const getTransform = () => transform;
	
	return { 
		getTransform, 
		dispose: unSubscribeToEvents, 
		on: noop, 
		smoothZoom,
		moveTo: noop,
	};
};


export type PanZoomHandler = PanZoom & { zoomIn : () => void, zoomOut: () => void };


export const centredPanZoom = (target: HTMLImageElement | SVGSVGElement, paddingW: number, paddingH: number) => {
	const targetContainer = target.parentElement;
	const parentRect = targetContainer.getBoundingClientRect();
	const originalSize = { width: 0, height: 0 };

	if (target.tagName.toLocaleLowerCase() === 'img') {
		const img:HTMLImageElement = target as HTMLImageElement;

		originalSize.width = img.naturalWidth;
		originalSize.height = img.naturalHeight;
	} else {
		const svg:SVGSVGElement = target as SVGSVGElement;
		originalSize.width = svg.viewBox.baseVal.width;
		originalSize.height = svg.viewBox.baseVal.height;
	}

	const size = aspectRatio(originalSize.width, originalSize.height, parentRect.width - paddingW * 2, parentRect.height - paddingH * 2);

	target.setAttribute('width', size.scaledWidth + 'px');
	target.setAttribute('height', size.scaledHeight + 'px');

	// const targetSize = target.getBoundingClientRect();

	// resizeObserver.current = new ResizeObserver(scaleSVG);
	// resizeObserver.current.observe(svgContainer);
	// scaleSVG();

	const options:PanZoomOptions = {
		maxZoom: 10,
		minZoom: 1,
		bounds: parentRect,
	};
	
	const pz = panzoom(target, options);

	// const actualPaddingW = (parentRect.width - size.scaledWidth) / 2 ;
	// const actualPaddingH = (parentRect.height -  size.scaledHeight ) / 2 ;

	// pz.on('transform', () => {
	// const targetRect = target.getBoundingClientRect();
	// const t = pz.getTransform();

	// const maxX =  actualPaddingW * t.scale;
	// const minX =  parentRect.width - targetRect.width - actualPaddingW * t.scale;


	// const maxY =  actualPaddingH * t.scale;
	// const minY =  parentRect.height - targetRect.height - actualPaddingH * t.scale;

	// if (t.x > maxX || t.x < minX || t.y > maxY || t.y < minY) {
	// const x = Math.max(Math.min(t.x, maxX), minX);
	// const y = Math.max(Math.min(t.y, maxY), minY);
	// pz.moveTo(x, y);
	// }
	// });


	const zoom = (scale) => {
		const contRect = targetContainer.getBoundingClientRect();
		pz.smoothZoom(contRect.width / 2 + contRect.x, contRect.height / 2 + contRect.y, scale);
	};

	const zoomIn = () => zoom(1.5);

	const zoomOut = () => zoom(1 / 1.5);

	return { ...pz, zoomIn, zoomOut } ;
};
