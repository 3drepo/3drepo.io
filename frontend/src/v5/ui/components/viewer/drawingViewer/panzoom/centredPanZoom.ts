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
import { Events, PanZoom, panzoom } from './panzoom';
import { ZoomableImage } from '../drawingViewerImage/drawingViewerImage.component';
import { clamp } from 'lodash';

export type PanZoomHandler = PanZoom & { zoomIn : () => void, zoomOut: () => void };

export const centredPanZoom = (target: ZoomableImage, paddingW: number, paddingH: number) => {

	const originalSize = target.getNaturalSize();
	target.setSize(originalSize);

	const targetContainer = target.getEventsEmitter();

	const options = {
		maxZoom: 100,
		minZoom: 0.01,
	};
	
	const pz = panzoom(target, options);


	let prevRect = targetContainer.getBoundingClientRect();

	const scaleTarget = () => {
		const parentRect = targetContainer.getBoundingClientRect();
		const fittedSize = aspectRatio(originalSize.width, originalSize.height, parentRect.width - paddingW * 2, parentRect.height - paddingH * 2);

		let scale = Math.min(fittedSize.scaledWidth / originalSize.width, fittedSize.scaledHeight / originalSize.height );
		pz.setMinZoom(scale);
	
		scale =  Math.max(scale, pz.getTransform().scale);

		const diffWidth = prevRect.width  - parentRect.width;

		pz.setTransform(pz.getTransform().x - (diffWidth / 2), pz.getTransform().y, scale);
		prevRect = parentRect;
	};

	const resizeObserver = new ResizeObserver(scaleTarget);
	resizeObserver.observe(targetContainer);
	pz.on(Events.transform, () => {
		const parentRect = targetContainer.getBoundingClientRect();
		const t = pz.getTransform();
		const size = target.getNaturalSize();
	
		const x = clamp(t.x, paddingW - size.width * t.scale, parentRect.width - paddingW);
		const y = clamp(t.y, paddingH - size.height * t.scale, parentRect.height - paddingH);
		pz.moveTo(x, y);
	});

	const zoomIn = () => pz.zoom(1.5);

	const zoomOut = () => pz.zoom(1 / 1.5);

	return { ...pz, zoomIn, zoomOut } ;
};
