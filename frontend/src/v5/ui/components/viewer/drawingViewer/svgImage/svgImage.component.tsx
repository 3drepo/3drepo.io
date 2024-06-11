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

import { useRef, useState, useEffect, forwardRef } from 'react';
import { Size } from 'react-virtualized-auto-sizer';
import { ZoomableImage, DrawingViewerImageProps } from '../drawingViewerImage/drawingViewerImage.component';


const worker = new Worker(new URL('./canvasRendererWorker', import.meta.url));
worker.addEventListener('message', (ev) => {
	console.log(ev);
});


type CanvasMatrixElem = { canv: HTMLCanvasElement,  canvID: number, col: number, row: number, toReposition: boolean, toRender: boolean, showing: boolean }; 


const rowCol = (x, y, width, height) => {
	const row = Math.max(Math.floor(-y / height), 0);
	const col = Math.max(Math.floor(-x / width), 0);

	return { row, col };
};

const drawInCanvas = async (img: HTMLImageElement, canvID, width, height, posX, posY, scale ) => {
	if (!img.width) return;

	createImageBitmap(img, posX / scale, posY / scale, width / scale,  height / scale, { resizeQuality: 'high', resizeHeight: height, resizeWidth: width }).then((bitmap) => {
		console.log('rendering ', posX / scale, posY / scale, width / scale,  height / scale);
		worker.postMessage({ method:'renderCanvas', payload: [canvID, bitmap] }, [bitmap]);
	});
};


const renderTiles = (img, tiles: CanvasMatrixElem[], width, height, pos, zoom) => {
	const origin = rowCol(pos.x, pos.y, width, height);

	tiles.forEach((elem, index) => {
		const { canvID, canv, row, col, toRender, toReposition, showing } = elem;
		
		if (toReposition) {
			const translate = `${width * (col - origin.col) }px ${height * (row - origin.row)}px`;
			canv.style.translate = translate;
		}

		if (toRender) {
			if (!showing) {
				canv.style.visibility = 'collapse';
			} else {
				canv.style.visibility = 'visible';
				drawInCanvas(img, canvID, width, height ,  col * width, row * height, zoom);
				elem.toRender = false;
			}
		}
	});
};

const toIndex = (factor, col, row) => col + row * factor;
const indexToColRow = (factor, index) => ({ col: index % factor, row: Math.floor(index / factor) });

export const pannableSVG = (container: HTMLElement, src: string) => {
	const tiles: CanvasMatrixElem[] = [];
	const workerCanvases: OffscreenCanvas[] = [];
	const cols = 2;
	const rows = 2;
	let transform = { x: 0, y:0, scale: 1 };
	const img =  new Image();
	img.src = src; 

	img.addEventListener('load', () => {
		img.width = img.naturalWidth;
		img.height = img.naturalHeight;
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		render(transform);
	});

	const root:HTMLDivElement = document.createElement('div');

	for (let i = 0 ; i < cols * rows; i++ ) {
		const canv:HTMLCanvasElement = document.createElement('canvas');
		canv.width = container.offsetWidth;
		canv.height = container.offsetHeight;
		canv.style.position = 'absolute';
		canv.style.padding = '0';
		canv.style.margin = '0';
		canv.style.border = '0';

		root.appendChild(canv);
		workerCanvases.push(canv.transferControlToOffscreen());
		tiles.push({ canv, canvID: i, col: i % cols, row:Math.floor(i / rows), toReposition: true, toRender: true, showing: true });
	}

	container.appendChild(root);

	worker.postMessage({ method:'setTiles', payload: [workerCanvases] }, workerCanvases as any);

	const render = (t) => {
		const width = container.offsetWidth;
		const height = container.offsetHeight;
		const { x, y, scale } = t;

		const topLeft = { x: Math.round(Math.max((x % width), x)), y: Math.round(Math.max((y % height), y)) };
		
		root.style.translate = `${topLeft.x}px ${topLeft.y}px`;
		
		const prevColRow = rowCol(transform.x, transform.y, width, height);
		const currentColRow = rowCol(x, y, width, height);
		
		const colChanged = !!(currentColRow.col - prevColRow.col); 
		const rowChanged = !!(currentColRow.row - prevColRow.row);
		const zoomChanged = !!(transform.scale - scale);

		console.log('rendering' + JSON.stringify(transform));

		if (colChanged || rowChanged || zoomChanged) { // if there's a column change
			const horizontalTiles = 2;
			const verticalTiles = 2;
			const colcount =  img.width * scale / width ;

			const tilesToShow = new Set<number>();

			for (let i = 0; i < horizontalTiles; i++ ) {
				for (let j = 0; j < verticalTiles; j++ ) {
					tilesToShow.add(toIndex(colcount, currentColRow.col + i, currentColRow.row + j));
				}
			}


			const tilesToReuse:CanvasMatrixElem[] = [];
			
			tiles.forEach((elem) => {
				elem.toReposition = true;
				const index = toIndex(colcount, elem.col, elem.row);
				elem.toRender = !tilesToShow.has(index) || zoomChanged;
				
				if (!elem.toRender) {
					tilesToShow.delete(index);
				} else {
					tilesToReuse.push(elem);
				}
			});

			for (let colRow of tilesToShow.values()) {
				const elem = tilesToReuse.pop() as CanvasMatrixElem;
				const { row, col } = indexToColRow(colcount, colRow);
				elem.row = row;
				elem.col = col;
			}
		}
		
		renderTiles(img, tiles, width, height, { x, y }, scale);
	};
	
	const addEventListener:typeof img.addEventListener =  (type, listener) => {
		img.addEventListener(type, listener);
	};

	return {
		set transform(t) {
			if (t.x === transform.x && t.y === transform.y && t.scale == transform.scale) return;
			render(t);
			transform = { ...t };
		},
		set src(s)  {
			if (s === img.src) return;
			img.src = s;
		},
		addEventListener,
		get naturalHeight() { return img.naturalHeight;},
		get naturalWidth() { return img.naturalWidth;},
	};
};

    
export const SVGImage = forwardRef<ZoomableImage, DrawingViewerImageProps>(({ onLoad, src }, ref ) => {
	const containerRef = useRef<HTMLElement>();
	const pannableImage = useRef<ReturnType<typeof pannableSVG>>();

	useEffect(() => {
		if (!containerRef.current || pannableImage.current) return;
		pannableImage.current = pannableSVG(containerRef.current, src);
		pannableImage.current.addEventListener('load', onLoad);
	}, []);


	useEffect(() => {
		if (!pannableImage.current) return;
		pannableImage.current.src = src;
	}, [src]);


	(ref as React.MutableRefObject<ZoomableImage>).current = {
		setTransform: (t) => {
			console.log('set transform' + JSON.stringify(t));

			if (!pannableImage.current) return;
			pannableImage.current.transform = t;
		},

		getEventsEmitter: () => {
			return containerRef.current;
		},
		
		getBoundingClientRect: () => {
			const bound = containerRef.current.getBoundingClientRect();
			// bound.x = transform.x; 
			// bound.y = transform.y;
			// bound.width *= transform.scale;
			// bound.height *= transform.scale;
			return bound ;
		},
		
		getNaturalSize: () =>  {
			return { width: pannableImage.current.naturalWidth, height: pannableImage.current.naturalHeight };
		},

		setSize: ({ width, height }: Size ) => {},
	};

	const width = 500;
	const height = 500;

	return (<div ref={containerRef as any} style={{ border:'3px solid #008bd180', width, height, overflow:'hidden' }} />);
});
