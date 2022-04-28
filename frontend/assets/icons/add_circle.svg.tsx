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

type IProps = {
	fillColour?: string;
	className?: string;
};

export default ({ fillColour, className }: IProps) => (fillColour ? (
	<svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<circle cx="16.6336" cy="15.8616" r="15.8616" fill="#00C1D4" />
		<path d="M16.6337 9.33063V22.3931" stroke={fillColour} strokeWidth="2" />
		<path d="M16.6337 9.33063V22.3931" stroke={fillColour} strokeWidth="2" />
		<path d="M23.1649 15.8619L10.1024 15.8619" stroke={fillColour} strokeWidth="2" />
		<path d="M23.1649 15.8619L10.1024 15.8619" stroke={fillColour} strokeWidth="2" />
		<defs>
			<linearGradient id="paint0_linear_6015_43099" x1="17.1337" y1="9.33063" x2="17.1337" y2="22.3931" gradientUnits="userSpaceOnUse">
				<stop stopColor="white" />
				<stop offset="1" stopColor="white" stopOpacity="0" />
			</linearGradient>
			<linearGradient id="paint1_linear_6015_43099" x1="23.1649" y1="16.3619" x2="10.1024" y2="16.3619" gradientUnits="userSpaceOnUse">
				<stop stopColor="white" />
				<stop offset="1" stopColor="white" stopOpacity="0" />
			</linearGradient>
		</defs>
	</svg>
) : (
	<svg width="15" height="15" viewBox="0 0 15 15" fill="white" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path d="M7.5 0.9375C3.87598 0.9375 0.9375 3.87598 0.9375 7.5C0.9375 11.124 3.87598 14.0625 7.5 14.0625C11.124 14.0625 14.0625 11.124 14.0625 7.5C14.0625 3.87598 11.124 0.9375 7.5 0.9375ZM10.3125 7.85156C10.3125 7.91602 10.2598 7.96875 10.1953 7.96875H7.96875V10.1953C7.96875 10.2598 7.91602 10.3125 7.85156 10.3125H7.14844C7.08398 10.3125 7.03125 10.2598 7.03125 10.1953V7.96875H4.80469C4.74023 7.96875 4.6875 7.91602 4.6875 7.85156V7.14844C4.6875 7.08398 4.74023 7.03125 4.80469 7.03125H7.03125V4.80469C7.03125 4.74023 7.08398 4.6875 7.14844 4.6875H7.85156C7.91602 4.6875 7.96875 4.74023 7.96875 4.80469V7.03125H10.1953C10.2598 7.03125 10.3125 7.08398 10.3125 7.14844V7.85156Z" fill="currentColor" />
	</svg>
));
