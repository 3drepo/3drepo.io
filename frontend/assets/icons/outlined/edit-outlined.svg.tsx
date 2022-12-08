/**
 *  Copyright (C) 2022 3D Repo Ltd
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
	<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" className={className}>
		<path
			d="M2.59416 9.21303C2.62095 9.21303 2.64773 9.21035 2.67452 9.20633L4.9272 8.81125C4.95398 8.80589 4.97943 8.79383 4.99818 8.77375L10.6754 3.09651C10.6878 3.08412 10.6977 3.06941 10.7044 3.0532C10.7111 3.037 10.7146 3.01963 10.7146 3.00209C10.7146 2.98455 10.7111 2.96718 10.7044 2.95098C10.6977 2.93478 10.6878 2.92006 10.6754 2.90767L8.44952 0.680441C8.42407 0.654994 8.39059 0.641602 8.35443 0.641602C8.31827 0.641602 8.28479 0.654994 8.25934 0.680441L2.58211 6.35767C2.56202 6.37776 2.54997 6.40187 2.54461 6.42866L2.14952 8.68133C2.13649 8.75308 2.14115 8.82692 2.16308 8.89647C2.18502 8.96601 2.22357 9.02916 2.27541 9.08044C2.3638 9.16616 2.47497 9.21303 2.59416 9.21303V9.21303ZM3.49684 6.87732L8.35443 2.02107L9.33613 3.00276L4.47854 7.85901L3.28791 8.06928L3.49684 6.87732V6.87732ZM10.9285 10.338H1.07139C0.83434 10.338 0.642822 10.5295 0.642822 10.7666V11.2487C0.642822 11.3077 0.691037 11.3559 0.749965 11.3559H11.25C11.3089 11.3559 11.3571 11.3077 11.3571 11.2487V10.7666C11.3571 10.5295 11.1656 10.338 10.9285 10.338Z"
			fill="currentColor"
		/>
	</svg>
);
