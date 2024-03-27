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
import { useRef, useEffect, forwardRef } from 'react';
import { SvgContainer } from './drawingViewer.styles';
import { sanitizeSvg } from '@svgedit/svgcanvas/core/sanitize';

export interface Zoomer { 
	zoomIn : () => void;
	zoomOut: () => void;
}

interface Props {
	svgContent: string;
	onLoad?: (...args) => void;
}

export const SvgViewer = forwardRef(({ svgContent, onLoad }: Props, ref) => {
	const svgContainerRef = useRef<HTMLElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);

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

		if (typeof ref === 'function') ref(svg);
		if (typeof ref === 'object') ref.current = svg;

		onLoad?.();
	}, [svgContent]);

	return (<SvgContainer ref={svgContainerRef as any} />);
});