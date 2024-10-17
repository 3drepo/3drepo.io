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
type IProps = {
	className?: any;
	style?: React.CSSProperties;
	arrowAngle?: number;
};


const cos45 = Math.cos(Math.PI / 4);


const scaleByAngle = (angle) => {
	const x = Math.abs(Math.cos(angle));
	const y = Math.abs(Math.sin(angle));

	return Math.min(x, y) / cos45;
};

export default ({ className, style, arrowAngle }: IProps) => (
	<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
		style={style}>
		<path style={{ transformOrigin: '50% 50%', rotate: `${arrowAngle}rad`, scale: `${1 + 0.2 * scaleByAngle(arrowAngle)} 1` }} d="M 27.5,43.5 -0.50000034,28 27.5,12.5 55.5,28 Z" fill="url(#paint0_linear_2_39)" id="path305" />
		<rect y="10" width="36" height="36" rx="5" fill="currentColor" id="rect307" x="10" />
		<path
			d="m 21.8086,29.7285 c -0.3883,0 -0.7031,0.3148 -0.7031,0.7031 0,0.3884 0.3148,0.7032 0.7031,0.7032 h 3.7109 c 0.3884,0 0.7032,-0.3148 0.7032,-0.7032 0,-0.3883 -0.3148,-0.7031 -0.7032,-0.7031 z"
			fill="#ffffff" id="path309" />
		<path fillRule="evenodd" clipRule="evenodd"
			d="m 19.11328,21.75 c 0,-0.3883 0.3148,-0.7031 0.70313,-0.7031 h 6.66979 c 0.1876,0 0.3674,0.0749 0.4995,0.2082 l 2.3145,2.3359 c 0.0384,0.0387 0.0713,0.0807 0.0988,0.1252 h 1.6882 c 0.3948,0 0.7149,0.32 0.7149,0.7148 v 1.5544 L 37.0273,23.965 C 37.4957,23.7839 38,24.1295 38,24.6317 v 8.7332 c 0,0.5017 -0.5033,0.8473 -0.9715,0.6672 l -5.2264,-2.0109 v 1.5444 c 0,0.3947 -0.32,0.7148 -0.7149,0.7148 H 18.71484 C 18.32002,34.2804 18,33.9603 18,33.5656 V 24.431 c 0,-0.3947 0.32,-0.7148 0.71484,-0.7148 h 0.39844 z m 7.07982,0.7031 1.2515,1.2631 h -6.9251 v -1.2631 z m -6.78685,2.6693 v 7.7518 H 30.3958 v -1.783 c -0.0088,-0.0632 -0.009,-0.1281 0,-0.193 v -3.7879 c -0.009,-0.0649 -0.0088,-0.1298 0,-0.193 v -1.7949 z m 12.39585,2.3707 v 3.0214 l 4.7917,1.8436 v -6.7178 z"
			fill="#ffffff" id="path311" />
		<defs id="defs322">
			<linearGradient id="paint0_linear_2_39" x1="17.5" y1="-6.7752597e-07" x2="17.5" y2="56"
				gradientUnits="userSpaceOnUse" gradientTransform="rotate(90,22.5,33)">
				<stop stopColor="currentColor" id="stop313" />
				<stop stopColor="currentColor" offset="0.5" id="stop315" />
				<stop stopColor="currentColor" offset="0.51" stopOpacity="0" id="stop317" />
				<stop stopColor="currentColor" offset="1" stopOpacity="0" id="stop319" />
			</linearGradient>
		</defs>
	</svg>);