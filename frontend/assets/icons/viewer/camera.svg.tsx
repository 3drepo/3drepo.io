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
	onMouseDown?:  React.MouseEventHandler<SVGSVGElement>;
	haloVisibility: number

};

export default ({ className, style, onMouseDown, haloVisibility }: IProps) => (
	<svg width="100" height="100" viewBox="0 0 100 100" onMouseDown={onMouseDown} fill="none" version="1.1" id="theCam"
		xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
		<circle cx="0" cy="0" r="30" stroke="#7067d100" fill="#7067d100" strokeOpacity="0" strokeWidth="0" id="circle7" />
		<path d="M 41.658742,-27.448895 -4.7557776,0.4428216 43.833276,26.507273 Z" fill="url(#paint0_radial_11_9573)" id="path2" style={{ scale: `${haloVisibility} 1` }} />
		<g filter="url(#filter0_d_11_9573)" id="g8" transform="rotate(45,72.286839,-4.9870769)">
			<circle fill="currentColor" cx="24.700001" cy="50.021999" r="9" transform="rotate(42.6921,24.7,50.022) " id="circle4" />
			<circle stroke="#ffffff" cx="24.700001" cy="50.021999" r="8" transform="rotate(42.6921,24.7,50.022)" strokeOpacity="0.7" strokeWidth="2" id="circle6" />
		</g>
		<path stroke="currentColor" d="m 12.786551,11.431403 c -2.22972,2.686369 -5.2246,4.630064 -8.586256,5.572284 -3.361586,0.94229 -6.9304946,0.838346 -10.2316226,-0.297763 -3.301057,-1.136179 -6.1779214,-3.250782 -8.2475524,-6.062309 -2.069631,-2.8115274 -3.233953,-6.1866894 -3.338039,-9.6762614 -0.104016,-3.489643 0.857084,-6.928162 2.755588,-9.858066 1.89844,-2.9298256 4.644178,-5.2120416 7.8717604,-6.5428936 3.22749,-1.330804 6.783883,-1.647092 10.1956026,-0.906822 3.411861,0.74027 6.517262,2.502026 8.902969,5.050793" strokeDasharray="10, 5" id="path10" />
		<defs id="defs36">
			<filter id="filter0_d_11_9573" x="10.7002" y="36.021999" width="28" height="28" filterUnits="userSpaceOnUse"
				colorInterpolationFilters="sRGB">
				<feFlood floodOpacity="0" result="BackgroundImageFix" id="feFlood12" />
				<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
					result="hardAlpha" id="feColorMatrix14" />
				<feMorphology radius="1" operator="dilate" in="SourceAlpha" result="effect1_dropShadow_11_9573"
					id="feMorphology16" />
				<feOffset id="feOffset18" />
				<feGaussianBlur stdDeviation="2" id="feGaussianBlur20" />
				<feComposite in2="hardAlpha" operator="out" id="feComposite22" />
				<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" id="feColorMatrix24" />
				<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_11_9573" id="feBlend26" />
				<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_11_9573" result="shape" id="feBlend28" />
			</filter>
			<radialGradient id="paint0_radial_11_9573" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
				gradientTransform="matrix(24.696351,-0.99531856,1.5656808,38.848463,16.143965,0.3918386)">
				<stop stopColor="currentColor" stopOpacity="0.6" id="stop31" />
				<stop stopColor="currentColor" offset="1" stopOpacity="0" id="stop33" />
			</radialGradient>
			<clipPath clipPathUnits="userSpaceOnUse" id="clipPath5530">
				<path d="M 38.178413,29.263395 -10.456162,56.193087 38.13289,82.257537 Z" id="path5532" fillOpacity="1" />
			</clipPath>
		</defs>
		<path id="path5518" stroke="currentColor" strokeWidth="1.1063" strokeDasharray="11.063, 5.53153" opacity={1 - haloVisibility}
			d="M 11.230385,56.162848 A 17.133312,17.197575 0 0 1 -5.9029262,73.360423 17.133312,17.197575 0 0 1 -23.03624,56.162848 17.133312,17.197575 0 0 1 -5.9029262,38.965273 17.133312,17.197575 0 0 1 11.230385,56.162848 Z"
			clipPath="url(#clipPath5530)"
			transform="translate(5.7721519,-55.057448)"
		/>
	</svg>
);
