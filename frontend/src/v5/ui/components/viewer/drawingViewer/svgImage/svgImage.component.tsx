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
import { ZoomableImage, DrawingViewerImageProps } from '../drawingViewerImage/drawingViewerImage.component';

type Transform = { x:number, y:number, scale:number };
type Vector2 = { x:number, y:number };

export const pannableSVG = (container: HTMLElement, src: string) => {

	let transform: Transform = { x: 0, y: 0, scale: 1 };
	let origin: Transform;
	let D : Transform;
	let projection: Transform;
	let tframe = 0;
	let drawing = false;
	let onLoad: any;

	// The overdraw for the Canvas, as a scalar. Overdraw means to create a
	// larger canvas than is displayed in the containing element. This allows
	// the user to pan without seeing missing parts of the image as they are
	// already rendered offscreen.
	// Larger overdraw allows the user to pan more without missing anything,
	// but requires a larger canvas, and so more memory and more time to
	// repaint.

	const overdraw = 2;

	// vw & vh describe the viewport into the Canvas. These should be the same
	// dimensions as the container element.

	const vw = 1000;
	const vh = 1000;

	// The canvas will show the drawing. The canvas can move inside its parent
	// element to enable fast panning and zooming, but afterwards a re-paint
	// should occur.

	const canvas = document.createElement('canvas');
	canvas.width = vw * overdraw;
	canvas.height = vh * overdraw;

	const ctx = canvas.getContext('bitmaprenderer');

	// The canvas is the actual element in the DOM that will show the image

	container.appendChild(canvas);

	/**
	 * Given an image, work out what the initial transform (projection) should be
	 * such that the image sits in the center of the overdrawn canvas and takes up
	 * the entire container element, while maintaining its aspect ratio.
	 */
	const calculateProjection = (img: HTMLImageElement) : Transform => {
		// The natural size is in the units of the projection transform
		const w = img.naturalWidth;
		const h = img.naturalHeight;

		// The scale in either axis needed to fill the viewport
		const sx = w / vw;
		const sy = h / vh;

		let scale = Math.max(sx, sy);

		// Scale should go down with multiplication, to match matrix conventions
		scale = 1 / scale;

		// Apply this scale to the image
		let proj: Transform = { x: 0, y: 0, scale };

		// Finally get the offsets.
		// sw & sh are the size of the scaled image. dx & dy are the sizes of
		// the total 'whitespace' after the image is scaled during projection,
		// and are used to center it. Note here that we use the actual canvas
		// size, whereas when working out the scale we used the viewport size.

		const sw = w * scale;
		const sh = h * scale;

		const dx = canvas.width - sw;
		const dy = canvas.height - sh;

		proj.x = dx * 0.5;
		proj.y = dy * 0.5;

		return proj;
	};

	/**
	 * Compose transform b with a, so that transforming an entity is the
	 * equivalent of transforming it by a, then by b.
	 */
	const compose = (a: Transform, b: Transform) : Transform => {
		return {
			x: (a.x * b.scale) + b.x,
			y: (a.y * b.scale) + b.y,
			scale: a.scale * b.scale,
		};
	};

	/**
	 * Returns a transform that undoes transform a. Composing a with its inverse,
	 * or its inverse with a will result in an identity transform.
	 */
	const invert = (a: Transform) : Transform => {
		return {
			x: -a.x / a.scale,
			y: -a.y / a.scale,
			scale: 1 / a.scale,
		};
	};

	/**
	 * Get the transform that goes from a onto b. Multiplying a composition
	 * of a with this transform will be the equivalent of multiplying with
	 * b directly.
	 */
	const difference = (a: Transform, b: Transform) : Transform => {
		return compose(invert(a), b);
	};


	/**
	 * Applies transform a to the vector v/transforms v by a.
	 */
	const multiply = (a: Transform, v: Vector2): Vector2 => {
		return {
			x: (v.x * a.scale) + a.x,
			y: (v.y * a.scale) + a.y,
		};
	};

	// Do some checks, these should be put in unit tests going forward...
	// --

	let a: Transform = { x: 1, y: 1, scale: 2 };
	let b: Transform = { x: 5, y: 5, scale: 3 };
	const v1: Vector2 = { x: 1, y: 1 };

	const A = compose(invert(a), a);
	const B = compose(a, invert(a));

	// both A & B should be identity, because a transform composed with its inverse is identity

	const c1 = multiply(a, v1);
	const c2 = multiply(b, c1);
	const c3 = multiply(compose(a, b), v1);

	// c2 should equal c3, because v1 multiplied by a, then b, should be the same as it multiplied by the composition of a and b

	const c4 = multiply(invert(b), c3);

	// and c4 should equal c1, because c3 is a composition of a and b, so removing b should return it to v1 multiplied by a

	const c5 = multiply(b, v1);
	const c6 = difference(a, b);
	const c7 = multiply(compose(a, c6), v1);

	// c7 should equal c5, because difference gets the transform between a and b, so multipling c1 with the composition of a and this, is the same
	// as multiplying it with b.

	// --

	/**
	* Gets a transform in a form that can be applied as a style attribute
	*/
	const getCSStransform = (t: Transform) => {
		return `translate(${t.x}px, ${t.y}px) scale(${t.scale}, ${t.scale})`;
	};

	/**
	 * Update the Canvas transform to manifest the difference between Projection
	 * and D, and apply it as a CSS style attribute. This method will also apply
	 * the centering for the overdraw, which should not be part of D.
	 */
	const updateCanvasTransform = () => {
		let dt = difference(projection, D);

		const overdrawOffset = {
			x: -(canvas.width - vw) * 0.5,
			y: -(canvas.height - vh) * 0.5,
			scale: 1,
		};
		dt = compose(dt, overdrawOffset);

		canvas.setAttribute('style', `transform: ${getCSStransform(dt)}; transform-origin: top left; user-select:none`);
	};

	/**
	 * Rasterises the current image into the canvas with the given projection
	 */
	const drawImage = (t: Transform, resolve: any) => {

		// This function uses drawImage to project img into canvas, by working
		// out the appropriate source rect to draw into the full canvas.

		// To get the source rect, the transform is 'inverted' to convert it
		// from canvas-space to natural-image-space.
		// These drawing methods take integers only, so round here explicitly
		// so we can be sure of the rounding behaviour.

		const sx = Math.round(-t.x / t.scale);
		const sy = Math.round(-t.y / t.scale);
		const sw = Math.round(canvas.width / t.scale);
		const sh = Math.round(canvas.height / t.scale);

		// Render asynchronously using createImageBitmap (does not work in Firefox)

		createImageBitmap(img, sx, sy, sw, sh, { resizeWidth: canvas.width, resizeHeight: canvas.height }).then((bm) => {
			// transferFromImageBitmap should take place almost immediately. An
			// alternative is to pass control of the canvas to a WebWorker and
			// have the bitmap exchanged there, though in that case it is harder
			// to synchronise the update of the style transform.

			ctx?.transferFromImageBitmap(bm);

			// When zoomed in very close, Canvas pixels may become smaller than
			// natural image pixels. However, the source region can only be
			// specified in natural image pixels.
			// Consequently, the true projection is that which is effected by the
			// rounded arguments to createImageBitmap or drawImage, not necessarily
			// the transform passed into the function.
			// Compute the actual projection below, ensuring any sub-natural-pixel
			// offets remain in the style transform after the diff, and the image
			// remains stable.

			const actualScale = canvas.width / sw;
			projection = {
				x: -sx * actualScale,
				y: -sy * actualScale,
				scale: actualScale,
			};

			if (resolve) {
				resolve();
			}
		});


		/* Render synchronously with drawImage
		ctx?.clearRect(0, 0, canvas.width, canvas.height);
		ctx?.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
		projection = t;
		if(resolve){
			resolve();
		}
		*/
	};



	const onAnimationFrame = async () => {

		// Draw the image with the full desired projection

		const tn = tframe;

		// Flag that we are waiting on a render, which may take a number of
		// animation frames.
		drawing = true;

		drawImage(D, () => {
			updateCanvasTransform();

			// Check if we've updated the transform since the last render.
			// If so, issue the request again.
			if (tn !== tframe) {
				requestAnimationFrame(onAnimationFrame);
			} else {
				drawing = false;
			}
		});
	};

	// We will load the SVG into an image element, allowing it to interoperate
	// with CanvasRenderingContext. The SVG will for all intents and purposes
	// be a bitmap to our code, though behind the scenes the browser will
	// rasterise it based on the canvas size.

	const img = new Image();
	img.src = src;
	img.onload = () => {

		// In this version of the viewer, we store the origin and apply user transforms
		// on top of it.
		origin = calculateProjection(img);
		D = origin;
		projection = origin;
		drawImage(origin, updateCanvasTransform);

		// Start animating
		onAnimationFrame();

		if (onLoad) {
			onLoad();
		}
	};

	const addEventListener = (method : string, callback) => {
		if (method.toLowerCase() == 'load') {
			onLoad = callback;
		}
	};

	return {
		set transform(t: Transform) {
			if (t.x === transform.x && t.y === transform.y && t.scale === transform.scale) return;

			// This updates, but does not change the reference of, the absolute
			// transform that should be applied to the image.

			transform.x = t.x;
			transform.y = t.y;
			transform.scale = t.scale;

			// In this version of the code, the user transform is applied on top
			// of the origin projection (i.e. as if the image starts with an
			// identity transform)

			// Note that in this case we do not want to compose the transforms,
			// because a proper composition will scale the local offset of the
			// origin as well. Instead we append them in such a way that the
			// transform-origin appears at the top left of the viewport.

			// This is done by applying an additional offset based on scaling
			// the 'whitespace' between the (overdrawn) canvas edge, and the
			// location of the actual image.

			D = {
				x: origin.x + transform.x - (origin.x - (vw * overdraw - vw) * 0.5) * (1 - transform.scale),
				y: origin.y + transform.y - (origin.y - (vh * overdraw - vh) * 0.5) * (1 - transform.scale),
				scale: origin.scale * transform.scale,
			};

			// To show the desired transform to the user, get the remaining
			// difference between the current projection and it, and apply
			// it as css transform.

			updateCanvasTransform();

			tframe++;

			if (!drawing) {
				requestAnimationFrame(onAnimationFrame);
			}
		},

		/**
		 * Updates the SVG. This sill start a new load and reset the projection.
		 */
		set src(s: string) {
			if (s === img.src) return;
			img.src = s;
		},

		addEventListener,

		// The actual image size depends on the projection, and remaining
		// Canvas transform. As far as outer components are aware, the
		// the true image size is the same as the viewport, with the
		// transform-origin at the top left.

		get naturalWidth() : number {
			return vw;
		},

		get naturalHeight() : number {
			return vh;
		},
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

		setSize: () => {},
	};

	return (<div ref={containerRef as any} style={{ overflow:'hidden' }} />);
});
