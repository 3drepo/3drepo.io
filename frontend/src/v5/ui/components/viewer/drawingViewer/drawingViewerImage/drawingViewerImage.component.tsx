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

import { forwardRef, useRef } from 'react';
import { ZoomableImage } from '../zoomableImage.types';


export type DrawingViewerImageProps = {
	onLoad?: (...args) => void,
	src: string
};

export const DrawingViewerImage = forwardRef<ZoomableImage, DrawingViewerImageProps>(({ onLoad, src }, ref ) => {
	const imgRef = useRef<HTMLImageElement>();

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

	};

	return (
		<img src={src} onLoad={onLoad} ref={imgRef} style={{ transformOrigin: '0 0', userSelect: 'none' }} draggable={false} />
	);
});