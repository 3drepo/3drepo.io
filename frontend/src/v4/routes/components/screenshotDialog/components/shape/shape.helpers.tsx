/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { forwardRef } from 'react';
import {
	Arrow as ArrowComponent,
	Circle as CircleComponent,
	Line as LineComponent,
	Path,
	Rect as RectangleComponent,
	RegularPolygon as PolygonComponent,
} from 'react-konva';

export const cloud = {
	// eslint-disable-next-line max-len
	path: 'm 435.3,0 c -4.18197,-0.07349403 -8.31312,0.92486775 -12,2.9 -9.6,5.5 -11.9,17.8 -12.4,21.9 C 399.9,8.1 383.9,0 371,0 366.81803,-0.07349403 362.68688,0.92486775 359,2.9 349.3,8.4 347.1,20.7 346.5,24.8 335.6,8.1 319.5,0 306.6,0 302.41803,-0.07349403 298.28688,0.92486775 294.6,2.9 285,8.4 282.7,20.7 282.2,24.8 271.2,8.1 255.2,0 242.3,0 c -4.18197,-0.07349403 -8.31312,0.92486775 -12,2.9 -9.7,5.5 -11.9,17.8 -12.5,21.9 C 206.9,8.1 190.8,0 177.9,0 173.71803,-0.07349403 169.58688,0.92486775 165.9,2.9 156.3,8.4 154,20.7 153.5,24.8 142.5,8.1 126.5,0 113.6,0 109.41803,-0.07349403 105.28688,0.92486775 101.6,2.9 91.9,8.4 89.7,20.7 89.1,24.8 78.2,8.1 62.2,0 49.2,0 45.018034,-0.07349403 40.886882,0.92486775 37.2,2.9 27.6,8.4 25.3,20.7 24.8,24.8 2.4,39.5 -4.6,63.5 2.9,76.7 8.4,86.3 20.7,88.6 24.8,89.1 2.4,103.9 -4.6,127.8 2.9,141 c 5.5,9.7 17.8,11.9 21.9,12.5 -22.4,14.7 -29.4,38.7 -21.9,51.9 5.5,9.6 17.8,11.9 21.9,12.4 -22.4,14.8 -29.4,38.7 -21.9,51.9 5.5,9.7 17.8,11.9 21.9,12.5 -22.4,14.7 -29.4,38.7 -21.9,51.9 5.5,9.6 17.8,11.9 21.9,12.4 -22.4,14.8 -29.4,38.7 -21.9,51.9 5.5,9.7 17.8,11.9 21.9,12.5 -22.4,14.7 -29.4,38.7 -21.9,51.9 5.5,9.6 17.8,11.9 21.9,12.4 10.9,16.7 27,24.8 39.9,24.8 4.181966,0.0735 8.313118,-0.92487 12,-2.9 9.6,-5.5 11.9,-17.8 12.4,-21.9 11,16.7 27,24.8 39.9,24.8 4.18197,0.0735 8.31312,-0.92487 12,-2.9 9.7,-5.5 11.9,-17.8 12.5,-21.9 10.9,16.7 27,24.8 39.9,24.8 4.18197,0.0735 8.31312,-0.92487 12,-2.9 9.6,-5.5 11.9,-17.8 12.4,-21.9 11,16.7 27,24.8 39.9,24.8 4.18197,0.0735 8.31312,-0.92487 12,-2.9 9.7,-5.5 11.9,-17.8 12.5,-21.9 10.9,16.7 27,24.8 39.9,24.8 4.18197,0.0735 8.31312,-0.92487 12,-2.9 9.6,-5.5 11.9,-17.8 12.4,-21.9 11,16.7 27,24.8 39.9,24.8 4.18197,0.0735 8.31312,-0.92487 12,-2.9 9.7,-5.5 11.9,-17.8 12.5,-21.9 10.9,16.7 26.9,24.8 39.9,24.8 4.18197,0.0735 8.31312,-0.92487 12,-2.9 9.6,-5.5 11.9,-17.8 12.4,-21.9 22.4,-14.7 29.4,-38.7 21.9,-51.9 -5.5,-9.6 -17.8,-11.9 -21.9,-12.4 22.4,-14.8 29.4,-38.7 21.9,-51.9 -5.5,-9.7 -17.8,-11.9 -21.9,-12.5 22.4,-14.7 29.4,-38.7 21.9,-51.9 -5.5,-9.6 -17.8,-11.9 -21.9,-12.4 22.4,-14.8 29.4,-38.7 21.9,-51.9 -5.5,-9.7 -17.8,-11.9 -21.9,-12.5 22.4,-14.7 29.4,-38.7 21.9,-51.9 -5.5,-9.6 -17.8,-11.9 -21.9,-12.4 22.4,-14.8 29.4,-38.7 21.9,-51.9 C 491.6,91.9 479.3,89.7 475.2,89.1 497.6,74.4 504.6,50.4 497.1,37.2 491.6,27.6 479.3,25.3 475.2,24.8 464.3,8.1 448.2,0 435.3,0 Z',
	height: 500,
	width: 500
};

const TriangleComponent = forwardRef((props: any, ref: any) => {
	return (
		<PolygonComponent
			{...props}
			ref={ref}
			sides={3}
		/>
	);
});

const CloudComponent = forwardRef((props: any, ref: any) => {
	return (
		<Path
			{...props}
			ref={ref}
			data={cloud.path}
		/>
	);
});

export const Arrow = ArrowComponent;
export const Circle = CircleComponent;
export const Rectangle = RectangleComponent;
export const Triangle = TriangleComponent;
export const Line = LineComponent;
export const Cloud = CloudComponent;
