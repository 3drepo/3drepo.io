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

import { ZoomableImage } from '../../drawingViewerImage/drawingViewerImage.component';

type GrayscaleImage = {
	width: number,
	height: number,
	data: Float32Array
};

/**
 * A filter with a predefined size of 3x3
 */
class Filter3x3 {

	// Scalars of each component
	C: number[];

	// Offsets in the x axis of each component
	X: number[];

	// Offsets in the y axis of each component
	Y: number[];

	length: number;

	constructor(coefficients: number[]) {
		this.C = coefficients;
		this.X = [
			-1, 0, 1,
			-1, 0, 1,
			-1, 0, 1,
		];
		this.Y = [
			 1,  1,  1,
			 0,  0,  0,
			-1, -1, -1,
		];
		this.length = 9;
	}

	convolvePixel(input: Float32Array, width: number, x: number, y: number ) : number {
		let value = 0;
		for (let c = 0; c < this.length; c++) {
			const samplex = x + this.X[c];
			const sampley = y + this.Y[c];
			const index = samplex + (sampley * width);
			const w = this.C[c];
			value += input[index] * w;
		}
		return value;
	}

	/**
	 * Convolves the kernel with input and overwrites the result in
	 * output
	 */
	convolve(input: GrayscaleImage, result: Float32Array) {

		const width = input.width;
		const height = input.height;

		// The border around the edge of output is ignored.
		for (let x = 1; x < width - 1; x++) {
			for (let y = 1; y < height - 1; y++) {
				let value = 0;
				for (let c = 0; c < this.length; c++) {
					const samplex = x + this.X[c];
					const sampley = y + this.Y[c];
					const index = samplex + (sampley * width);
					const w = this.C[c];
					value += input.data[index] * w;
				}
				const index = x + (y * width);
				result[index] = value;
			}
		}
	}
}

class Matrix2x2 {

	m11: number;

	m12: number;

	m21: number;

	m22: number;

	constructor(m11: number, m12: number, m21: number, m22: number) {
		this.m11 = m11;
		this.m12 = m12;
		this.m21 = m21;
		this.m22 = m22;
	}

	determinant() {
		return (this.m11 * this.m22) - (this.m12 * this.m21);
	}

	trace() {
		return this.m11 + this.m22;
	}
}

class HarrisDetector {

	Ix: Float32Array;

	Iy: Float32Array;

	Ixx: Float32Array;

	Iyy: Float32Array;

	Ixy: Float32Array;

	kernel: Filter3x3;

	sobelX: Filter3x3;

	sobelY: Filter3x3;

	width: number;

	height: number;

	edgeMap: Float32Array;

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;

		const numPixels = width * height;
		this.Ix = new Float32Array(numPixels);
		this.Iy = new Float32Array(numPixels);
		this.Ixx = new Float32Array(numPixels);
		this.Ixy = new Float32Array(numPixels);
		this.Iyy = new Float32Array(numPixels);

		this.sobelX = new Filter3x3([1, 0, -1, 2, 0, -2, 1, 0, -1]);
		this.sobelY = new Filter3x3([1, 2, 1, 0, 0, 0, -1, -2, -1]);

		// These coefficients define a Gaussian Kernel
		this.kernel = new Filter3x3([
			0.0751, 0.1238, 0.0751,
			0.1238, 0.2042, 0.1238,
			0.0751, 0.1238, 0.0751,
		]);

		this.edgeMap = new Float32Array(numPixels);
	}

	multiply(a: Float32Array, b: Float32Array, out: Float32Array) {
		for (let i = 0; i < out.length; i++) {
			out[i] = a[i] * b[i];
		}
	}

	updateFeatureMap(grayscaleImage: Float32Array) {
		const input = {
			data: grayscaleImage,
			width: this.width,
			height: this.height,
		};

		this.sobelX.convolve(input, this.Ix);
		this.sobelY.convolve(input, this.Iy);

		this.multiply(this.Ix, this.Ix, this.Ixx);
		this.multiply(this.Iy, this.Iy, this.Iyy);
		this.multiply(this.Ix, this.Iy, this.Ixy);

		const width = this.width;
		const height = this.height;
		const K = this.kernel;

		// The border around the edge of output is ignored.
		for (let x = 1; x < width - 1; x++) {
			for (let y = 1; y < height - 1; y++) {

				const Sx2 = K.convolvePixel(this.Ixx, this.width, x, y);
				const Sy2 = K.convolvePixel(this.Iyy, this.width, x, y);
				const Sxy = K.convolvePixel(this.Ixy, this.width, x, y);

				const m = new Matrix2x2(
					Sx2, Sxy,
					Sxy, Sy2,
				);

				var r = m.determinant() - 0.05 * (m.trace() * m.trace());

				this.edgeMap[x + (y * width)] = (r * -2);
			}
		}
	}
}

/**
 * Allows snapping to an image feature (line or corner) based on pixel
 * colour values. Expected to be used with a Canvas object.
 */

export class CanvasSnap {

	canvas: HTMLCanvasElement;

	context: CanvasRenderingContext2D;

	grayscaleData: Float32Array;

	width: number;

	height: number;

	detector: HarrisDetector;

	constructor() {
		this.width = 500;
		this.height = 500;

		// Create a small canvas to receieve the area around the cursor
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.context = this.canvas.getContext('2d');
		this.context.fillStyle = 'red';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// Preallocate some arrays to hold the channels we will run the detector on
		this.grayscaleData = new Float32Array(this.canvas.width * this.canvas.height);

		this.detector = new HarrisDetector(this.width, this.height);
	}

	setDebugElement(element: HTMLElement) {
		element.appendChild(this.canvas);
		this.canvas.setAttribute('style', 'position: absolute; left: 0; top: 0; display: block; z-index: 1');
	}

	snap(ev: any, img: ZoomableImage) {
		// Copy the area around the cursor to the canvas
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.fillStyle = 'black';
		//this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		img.copyRegion(
			this.context,
			ev.x - this.width / 2,
			ev.y - this.height / 2,
			this.canvas.width,
			this.canvas.height,
		);

		this.updateSourceImages();

		this.detector.updateFeatureMap(this.grayscaleData);

		this.writeGrayscaleImage(this.detector.edgeMap);

		// Create the components for the harris detector

	}

	updateSourceImages() {
		const src = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
		const data = src.data;
		const stride = 4;
		for (let i = 0 ; i < this.grayscaleData.length; i++) {
			const r = data[i * stride + 0] / 255;
			const g = data[i * stride + 1] / 255;
			const b = data[i * stride + 2] / 255;
			const a = data[i * stride + 3] / 255;
			this.grayscaleData[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b + (a * 2); // Adding the opacity offsets the fi
		}
	}

	writeGrayscaleImage(grayscaleData: Float32Array) {
		const src = this.context.createImageData(this.canvas.width, this.canvas.height);
		//const src = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
		const data = src.data;
		const stride = 4;
		for (let i = 0 ; i < grayscaleData.length; i++) {
			data[i * stride + 0] = grayscaleData[i] * 255;
			data[i * stride + 1] = grayscaleData[i] * 255;
			data[i * stride + 2] = grayscaleData[i] * 255;
			data[i * stride + 3] = 255;
		}
		src.data.set(data);
		this.context.putImageData(src, 0, 0);
	}
}