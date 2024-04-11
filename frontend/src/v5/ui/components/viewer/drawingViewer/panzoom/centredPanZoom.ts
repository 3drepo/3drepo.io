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
import { PanZoom, panzoom } from './panzoom';

export type PanZoomHandler = PanZoom & { zoomIn : () => void, zoomOut: () => void };

export const centredPanZoom = (target: HTMLImageElement | SVGSVGElement, paddingW: number, paddingH: number) => {
	const targetContainer = target.parentElement;

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

	target.setAttribute('width', originalSize.width + 'px');
	target.setAttribute('height', originalSize.height + 'px');

	const options = {
		maxZoom: 3,
	};
	
	const pz = panzoom(target, options);

	let size = { scaledWidth: 0, scaledHeight:0 };

	const scaleTarget = () => {
		const parentRect = targetContainer.getBoundingClientRect();
		size = aspectRatio(originalSize.width, originalSize.height, parentRect.width - paddingW * 2, parentRect.height - paddingH * 2);

		pz.setMinZoom(Math.min(size.scaledWidth / originalSize.width, size.scaledHeight / originalSize.height ));
	};

	scaleTarget();
	const resizeObserver = new ResizeObserver(scaleTarget);
	resizeObserver.observe(targetContainer);
	pz.zoom(pz.getMinZoom(), false);

	pz.on('transform', () => {
		const parentRect = targetContainer.getBoundingClientRect();
		const actualPaddingW = (parentRect.width - size.scaledWidth) / 2 ;
		const actualPaddingH = (parentRect.height - size.scaledHeight ) / 2 ;
		const targetRect = target.getBoundingClientRect();
		
		const paddingScale =  targetRect.width / size.scaledWidth;
		const maxX =  actualPaddingW * paddingScale;
		const minX =  parentRect.width - targetRect.width - actualPaddingW * paddingScale;
		
		const maxY =  actualPaddingH * paddingScale;
		const minY =  parentRect.height - targetRect.height - actualPaddingH * paddingScale;
		
		const t = pz.getTransform();
		if (t.x > maxX || t.x < minX || t.y > maxY || t.y < minY) {
			const x = Math.max(Math.min(t.x, maxX), minX);
			const y = Math.max(Math.min(t.y, maxY), minY);
			pz.moveTo(x, y);
		}
	});

	const zoomIn = () => pz.zoom(1.5);

	const zoomOut = () => pz.zoom(1 / 1.5);

	return { ...pz, zoomIn, zoomOut } ;
};
