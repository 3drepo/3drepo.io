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

import { useRef, useState, useEffect } from 'react';

const worker = new Worker(new URL('./canvasRendererWorker.ts ', import.meta.url));

const originalSize = { width:0, height:0 };


type CanvasMatrixElem = { canv: HTMLCanvasElement,  canvID: number, col: number, row: number, toReposition: boolean, toRender: boolean, showing: boolean }; 


const rowCol = (x, y, width, height) => {
	const row = Math.max(Math.floor(-y / height), 0);
	const col = Math.max(Math.floor(-x / width), 0);

	return { row, col };
};

const drawInCanvas = async (img: HTMLImageElement, canvID, width, height, posX, posY, scale ) => {
	// const {width, height} = canvas;

	// const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
	// ctx.clearRect(0, 0, width, height);


	if (!img.width) return;

	createImageBitmap(img, posX / scale, posY / scale, width / scale,  height / scale, { resizeQuality: 'high', resizeHeight: height, resizeWidth: width }).then((bitmap) => {
		worker.postMessage({ method:'renderCanvas', payload: [canvID, bitmap] }, [bitmap]);
	});

	// ctx.drawImage(img, posX, posY, width/zoom,  height/zoom, 0,0, width, height);
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
				drawInCanvas(img, canvID, width, height,  col * width, row * height, zoom);
				elem.toRender = false;
			}
		}

	});
};

const toIndex = (factor, col, row) => col + row * factor;
const indexToColRow = (factor, index) => ({ col: index % factor, row: Math.floor(index / factor) });

// cuando zoomea tengo que fijarme el tema de que siga mostrando la misma cosa 
// hasta que haga el render de la nueva
export const SVGImage = ({ content, scale, x, y, width, height }) => {
	// canvasArrr :
	// [ 0 | 1 ]
	// [ 2 | 3 ]


	const canvasMatrix = useRef<CanvasMatrixElem[]>([]);

	const [pos, setPos] = useState({ x:0, y:0 });
	const [zoo, setZoo] = useState(1);
	
	const [img, setImage] = useState<HTMLImageElement>(new Image());

	const rootRef = useRef<HTMLDivElement>(null);


	useEffect(()=> {
		if (!rootRef.current) return;

		if (!canvasMatrix.current.length) {
			const newCanvasArr:CanvasMatrixElem[] = [];
			const canvasColl = rootRef.current.children as HTMLCollectionOf<HTMLCanvasElement>;			
			newCanvasArr.push({ canv: canvasColl[0], canvID: 0, col: 0, row:0, toReposition: true, toRender: true, showing: true });
			newCanvasArr.push({ canv: canvasColl[1], canvID: 1, col: 1, row:0, toReposition: true, toRender: true, showing: true });
			newCanvasArr.push({ canv: canvasColl[2], canvID: 2, col: 0, row:1, toReposition: true, toRender: true, showing: true });
			newCanvasArr.push({ canv: canvasColl[3], canvID: 3, col: 1, row:1, toReposition: true, toRender: true, showing: true });

			canvasMatrix.current = newCanvasArr;
			
			const canvases = canvasMatrix.current.map(({ canv }) => canv.transferControlToOffscreen());
			worker.postMessage({ method:'setTiles', payload: [canvases] }, canvases as any);
		} 
		

		return (() => {
			console.log('unmount');
		});
	}, []);


	// const drawAllInCanvas = useCallback((canvas) => {
	// 	const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
	// 	ctx.drawImage(img, 0, 0, img.width,  img.height, 0,0, width, height);
	// }, [img, width, height]);

	useEffect(() => {
		if (!content) return;
		const svgContainer  = document.createElement('div');
		svgContainer.innerHTML = content;
		const svg = svgContainer.querySelector('svg') as SVGSVGElement;
		const { width, height } = svg.viewBox.baseVal; 
		svg.setAttribute('width', width.toString());
		svg.setAttribute('height', height.toString());
		// sanitizeSvg(svg);


		originalSize.width = width;
		originalSize.height = height;
		const img =  new Image();
		img.width = width;
		img.height = height;
		const binString = Array.from(new TextEncoder().encode(svg.outerHTML), (byte) => String.fromCodePoint(byte)).join('');
		const base64 = btoa(binString);
		img.src = `data:image/svg+xml;base64,${base64}`;

		img.addEventListener('load', () => setImage(img));

	}, [content]);

	useEffect(() => {
		if (!canvasMatrix.current.length) return;

		canvasMatrix.current.forEach((val) => val.toRender = true);
	}, [img]);


	useEffect(() => {
		if (!rootRef.current || !canvasMatrix.current.length ) return;	

		const tiles = canvasMatrix.current;
		const topLeft = { x: Math.max((x % width), x), y: Math.max((y % height), y) };
		
		rootRef.current.style.translate = `${topLeft.x}px ${topLeft.y}px`;
		
		const prevColRow = rowCol(pos.x, pos.y, width, height);
		const currentColRow = rowCol(x, y, width, height);
		
		const colChanged = !!(currentColRow.col - prevColRow.col); 
		const rowChanged = !!(currentColRow.row - prevColRow.row);
		const zoomChanged = !!(zoo - scale);


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
		
		setPos({ x, y });
		setZoo(scale);
	
	}, [img, x, y, scale]);

	return (
		<div style={{ border:'3px solid #008bd180', width, height, scale: 2, overflow:'hidden' }}>
			<div ref={rootRef} style={{ transformOrigin:'0 0' }}>
				<canvas width={width} height={height} style={{ position:'absolute', boxSizing:'border-box', border:'0' }} />
				<canvas width={width} height={height} style={{ position:'absolute', boxSizing:'border-box', border:'0' }}/>
				<canvas width={width} height={height} style={{ position:'absolute', boxSizing:'border-box', border:'0' }} />
				<canvas width={width} height={height} style={{ position:'absolute', boxSizing:'border-box', border:'0' }}/>
			</div>
		</div>
	);
};
