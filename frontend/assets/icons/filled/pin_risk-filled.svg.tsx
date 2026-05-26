/**
 *  Copyright (C) 2025 3D Repo Ltd
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

type IProps = {
	className?: any;
};

export default ({ className }: IProps) => (
	<svg width="69" height="64" viewBox="0 0 69 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<ellipse id="selectionFill" strokeWidth="0" fill="#000000" visibility="hidden"  cx="35.747791" cy="28.091486" rx="14.706719" ry="23.134165" />
		<path
			id="main"
			fill="currentColor"
			d="M 4.7423497,0.06085732 C 1.1279459,0.1822271 -1.1319948,4.0945447 0.62924934,7.2993732 L 30.435698,61.527356 c 1.857352,3.379836 6.712781,3.376189 8.564448,-0.0069 L 68.684827,7.292608 C 70.466875,4.0371175 68.113912,0.06086078 64.402603,0.06085732 H 4.9114742 c -0.058048,0 -0.1117517,-0.0019265 -0.1691245,0 z M 34.657038,7.5699719 c 0.819883,-4.849e-4 1.627024,0.1898642 2.360975,0.5547272 0.7336,0.3648274 1.373903,0.8958621 1.867129,1.5491776 2.032132,2.5301693 2.602639,6.8861863 1.542415,11.6695693 -1.337667,6.029609 -3.435633,13.211981 -5.770519,13.211981 -2.334888,0 -4.432679,-7.183328 -5.770517,-13.22551 -1.060192,-4.783384 -0.489578,-9.138479 1.542412,-11.6560403 0.491078,-0.6554976 1.126105,-1.1908726 1.860366,-1.5559424 0.734227,-0.3650698 1.547337,-0.551426 2.367739,-0.5479624 z m 0,31.4706291 c 0.540366,-0.0066 1.074352,0.09102 1.576237,0.290913 0.501885,0.2002 0.959338,0.49618 1.346229,0.87268 0.386545,0.376154 0.700256,0.823864 0.913271,1.319168 0.213015,0.495304 0.324891,1.030526 0.331472,1.569472 -3.46e-4,0.797336 -0.240967,1.57488 -0.683263,2.239204 -0.442303,0.66433 -1.069524,1.185407 -1.806245,1.495059 -0.736721,0.309305 -1.548528,0.398896 -2.333913,0.250319 -0.785454,-0.148245 -1.511414,-0.525438 -2.08361,-1.082395 -0.572162,-0.556957 -0.961727,-1.270462 -1.12975,-2.049786 -0.168022,-0.779671 -0.102739,-1.59165 0.189418,-2.333913 0.29216,-0.741917 0.792794,-1.382522 1.447703,-1.840072 0.654908,-0.457203 1.433269,-0.710529 2.232438,-0.730618 z"
		/>
	</svg>
);
