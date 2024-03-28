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


const panzoom = (target: HTMLElement | SVGElement, options) => {
	const transform = { scale:1, x: 0, y: 0 };
	const zoomStep = 0.2;
	target.style.transformOrigin = '0 0';
	target.style.userSelect = 'none';
	target.setAttribute('draggable', 'false');
	const scrollHorizontal = document.createElement('div');
	const scrollVertical = document.createElement('div');
	scrollHorizontal.style.width = 'fit-content';
	scrollHorizontal.style.height = 'fit-content';
	scrollVertical.style.width = 'fit-content';
	scrollVertical.style.height = 'fit-content';
	const container = target.parentElement;

	target.parentElement.replaceChild(scrollHorizontal, target);
	
	scrollHorizontal.appendChild(scrollVertical);
	scrollVertical.appendChild(target);

	const speed = { x:0, y: 0 };


	const onWheel = (ev: WheelEvent) => {
		const newScale = transform.scale * (1 + zoomStep * -Math.sign(ev.deltaY));
		const originalRect = target.getBoundingClientRect();
		const targetPos = { x: ev.clientX - originalRect.x, y: ev.clientY - originalRect.y } ;

		const scaleChange = newScale / transform.scale;
		const newPos = { x: transform.x + targetPos.x * (1 - scaleChange), y: transform.y + targetPos.y * ( 1 - scaleChange) };

		transform.scale = newScale;
		transform.x = newPos.x;
		transform.y = newPos.y;

		scrollHorizontal.style.transition = 'none';
		scrollVertical.style.transition = 'none';

		target.style.transform = 'scale(' + transform.scale + ')'; 
		scrollHorizontal.style.transform = 'translateX(' + transform.x + 'px)';
		scrollVertical.style.transform = 'translateY(' + transform.y + 'px)';

		speed.x = 0;
		speed.y = 0;
	};

	const onMouseMove = (ev: MouseEvent) => {
		transform.x += ev.movementX;
		transform.y += ev.movementY;
	
		target.style.transform = 'scale(' + transform.scale + ')'; 
		scrollHorizontal.style.transform = 'translateX(' + transform.x + 'px)';
		scrollVertical.style.transform = 'translateY(' + transform.y + 'px)';

		speed.x = ev.movementX * 10;
		speed.y = ev.movementY * 10;
	};

	const onMouseDown = () => {
		
		const parentRect = container.getBoundingClientRect();

		transform.x = scrollHorizontal.getBoundingClientRect().x - parentRect.x;
		transform.y = scrollVertical.getBoundingClientRect().y - parentRect.y;
		
		
		scrollHorizontal.style.transition = 'none';
		scrollVertical.style.transition = 'none';
		
		scrollHorizontal.style.transform = 'translateX(' + transform.x + 'px)';
		scrollVertical.style.transform = 'translateY(' + transform.y + 'px)';

		speed.x = 0;
		speed.y = 0;
		
		container.addEventListener('mousemove', onMouseMove);
	};

	const onMouseUp = () => {
		container.removeEventListener('mousemove', onMouseMove);

		const acc = 9.8;
		const tx = Math.abs((speed.x / acc) / 10);
		const ty = Math.abs((speed.y / acc) / 10);
		const t = Math.max(tx,ty);

		const acc2 =  acc * 2;

		transform.x += speed.x ** 2  * Math.sign(speed.x) / acc2;
		transform.y += speed.y ** 2  * Math.sign(speed.y) / acc2;



		scrollHorizontal.style.transition = `all ${t}s cubic-bezier(0,.33,.66,1)`;
		scrollVertical.style.transition = `all ${t}s cubic-bezier(0,.33,.66,1)`;
		
		scrollHorizontal.style.transform = 'translateX(' + transform.x + 'px)';
		scrollVertical.style.transform = 'translateY(' + transform.y + 'px)';
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
		smoothZoom:noop,
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

	const actualPaddingW = (parentRect.width - size.scaledWidth) / 2 ;
	const actualPaddingH = (parentRect.height -  size.scaledHeight ) / 2 ;

	// pz.on('transform', () => {
	// 	const targetRect = target.getBoundingClientRect();
	// 	const t = pz.getTransform();

	// 	const maxX =  actualPaddingW * t.scale;
	// 	const minX =  parentRect.width - targetRect.width - actualPaddingW * t.scale;


	// 	const maxY =  actualPaddingH * t.scale;
	// 	const minY =  parentRect.height - targetRect.height - actualPaddingH * t.scale;

	// 	if (t.x > maxX || t.x < minX || t.y > maxY || t.y < minY) {
	// 		const x = Math.max(Math.min(t.x, maxX), minX);
	// 		const y = Math.max(Math.min(t.y, maxY), minY);
	// 		pz.moveTo(x, y);
	// 	}
	// });


	const zoom = (scale) => {
		const contRect = targetContainer.getBoundingClientRect();
		pz.smoothZoom(contRect.width / 2 + contRect.x, contRect.height / 2 + contRect.y, scale);
	};

	const zoomIn = () => zoom(1.5);

	const zoomOut = () => zoom(1 / 1.5);

	return { ...pz, zoomIn, zoomOut } ;
};
