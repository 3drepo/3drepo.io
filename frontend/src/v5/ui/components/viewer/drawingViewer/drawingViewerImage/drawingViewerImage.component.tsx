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

import { getDrawingImageSrc } from '@/v5/store/drawings/drawings.helpers';
import { useSearchParam } from '@/v5/ui/routes/useSearchParam';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { CentredContainer } from '@controls/centredContainer';

type Transform = {
	x: number;
	y: number;
	scale: number;
};

type Size = {
	width: number;
	height: number;
};

export type ZoomableImage = {
	setTransform: (transform: Transform) => void;
	getEventsEmitter: () => HTMLElement;
	getBoundingClientRect: () => DOMRect;
	getNaturalSize: () => Size;
	setSize: (size: Size) => void;
};

type DrawingViewerImageProps = { onLoad: (...args) => void };
export const DrawingViewerImage = forwardRef<ZoomableImage, DrawingViewerImageProps>(({ onLoad }, ref ) => {
	const [drawingId] = useSearchParam('drawingId');
	const [isLoading, setIsLoading] = useState(true);
	const imgRef = useRef<HTMLImageElement>();

	const src = getDrawingImageSrc(drawingId);

	useEffect(() => {
		setIsLoading(true);
		fetch(src).then(() => setIsLoading(false));
	}, [drawingId]);

	if (isLoading) return (
		<CentredContainer>
			<Loader />
		</CentredContainer>
	);

	(ref as any).current = {
		setTransform: ({ scale, x, y }) => {
			imgRef.current.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${x}, ${y})`;
		},

		getEventsEmitter: () => {
			return imgRef.current.parentElement;
		},

		getBoundingClientRect: () => {
			return imgRef.current.getBoundingClientRect();
		},
		
		getNaturalSize: () =>  {
			const img = imgRef.current;
			return { width: img.naturalWidth, height: img.naturalHeight };
		},

		setSize: ({ width, height }: Size ) => {
			const img = imgRef.current;
			img.setAttribute('width', width + 'px');
			img.setAttribute('height', height + 'px');
		},
	};

	return <img src={src} onLoad={onLoad} ref={imgRef} style={{ transformOrigin: '0 0', userSelect: 'none' }} draggable={false} />;
});