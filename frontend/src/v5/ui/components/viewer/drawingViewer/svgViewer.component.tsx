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
import panzoom, { PanZoom, PanZoomOptions } from 'panzoom';
import { useRef, useEffect } from 'react';
import { SvgContainer } from './drawingViewer.styles';
import { sanitizeSvg } from '@svgedit/svgcanvas/core/sanitize';

export interface Zoomer { 
	zoomIn : () => void;
	zoomOut: () => void;
}

interface Props {
	svgContent: string;
	zRef: React.MutableRefObject<Zoomer>;
} 

export const SvgViewer = ({ svgContent, zRef }: Props) => {
	const padding = { horizontal: 20, vertical: 20 };
	const svgContainerRef = useRef<HTMLElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const zoomerRef = useRef<PanZoom>(null);
	const resizeObserver = useRef<any>(null);

	const zoom = (scale) => {
		if (!zoomerRef.current || !svgContainerRef.current) return;
		const editorRect = svgContainerRef.current.getBoundingClientRect();
		zoomerRef.current.smoothZoom(editorRect.width / 2 + editorRect.x, editorRect.height / 2 + editorRect.y, scale);

	};

	const zoomIn = () => zoom(1.5);

	const zoomOut = () => zoom(0.8);

	const scaleSVG = () => {
		if (!svgContainerRef.current || !svgContent) return;
		const svgContainer = svgContainerRef.current;
		const svg = svgRef.current;


		const editorRect = svgContainer.getBoundingClientRect();
		const viewBox = svg.viewBox.baseVal;
		const size = aspectRatio(viewBox.width, viewBox.height, editorRect.width - padding.horizontal * 2, editorRect.height - padding.vertical * 2);

		svg.setAttribute('width', size.scaledWidth + 'px');
		svg.setAttribute('height', size.scaledHeight + 'px');

	};


	useEffect(() => {
		if (!svgContainerRef.current || !svgContent) return;
		const svgContainer = svgContainerRef.current;

		const tempContainer = document.createElement('div');
		tempContainer.innerHTML = svgContent;

		const svg = tempContainer.querySelector('svg') as SVGSVGElement;
		sanitizeSvg(svg);

		if (svgContainer.children.length > 0) {
			svgContainer.removeChild(svgContainer.children[0]);
		}

		svgContainer.insertBefore(svg, svgContainer.children[0]);
		svgRef.current = svg;
		
		// resizeObserver.current = new ResizeObserver(scaleSVG);
		// resizeObserver.current.observe(svgContainer);

		scaleSVG();


		const options:PanZoomOptions = {
			maxZoom: 10,
			minZoom: 1,
			smoothScroll: true,
		};
		
		const pz = panzoom(svg, options);
		
		zoomerRef.current = pz;


		const editorRect = svgContainer.getBoundingClientRect();
		const originalSvgRect = svg.getBoundingClientRect();

		const paddingW = (editorRect.width - originalSvgRect.width ) / 2 ;
		const paddingH = (editorRect.height - originalSvgRect.height ) / 2 ;

		pz.on('transform', () => {
			// const editorRect = svgContainer.getBoundingClientRect();
			const svgRect = svg.getBoundingClientRect();
			const t = pz.getTransform();

			const maxX =  paddingW * t.scale;
			const minX =  editorRect.width - svgRect.width - paddingW * t.scale;


			const maxY =  paddingH * t.scale;
			const minY =  editorRect.height - svgRect.height - paddingH * t.scale;

			if (t.x > maxX || t.x < minX || t.y > maxY || t.y < minY) {
				const x = Math.max(Math.min(t.x, maxX), minX);
				const y = Math.max(Math.min(t.y, maxY), minY);
				pz.moveTo(x, y);
				// pz.resume();
 			}
		});

		return () => {
			pz?.dispose();
			svgRef.current = null;
			zoomerRef.current = null;
			resizeObserver.current?.disconnect();
		};
	}, [svgContent]);


	useEffect(() => {
		zRef.current = { zoomIn, zoomOut };
	}, []);

	return (<SvgContainer ref={svgContainerRef as any} />);
};