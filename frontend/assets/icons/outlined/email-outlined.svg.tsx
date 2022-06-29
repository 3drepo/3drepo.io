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
	<svg
		width="36"
		height="36"
		viewBox="0 0 36 36"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className={className}
	>
		<g clipPath="url(#clip0_806_8971)">
			<path
				d="M34.7143 3.84961H1.28571C0.574554 3.84961 0 4.42416 0 5.13532V30.8496C0 31.5608 0.574554 32.1353 1.28571 32.1353H34.7143C35.4254 32.1353 36 31.5608 36 30.8496V5.13532C36 4.42416 35.4254 3.84961 34.7143 3.84961ZM33.1071 8.30139V29.2425H2.89286V8.30139L1.78393 7.43756L3.36295 5.40854L5.08259 6.74648H30.9214L32.6411 5.40854L34.2201 7.43756L33.1071 8.30139ZM30.9214 6.74247L18 16.7871L5.07857 6.74247L3.35893 5.40452L1.77991 7.43354L2.88884 8.29738L16.6138 18.9688C17.0086 19.2755 17.4941 19.4419 17.994 19.4419C18.4938 19.4419 18.9794 19.2755 19.3741 18.9688L33.1071 8.30139L34.2161 7.43756L32.6371 5.40854L30.9214 6.74247Z"
				fill="currentColor"
			/>
		</g>
		<defs>
			<clipPath id="clip0_806_8971">
				<rect width="36" height="36" fill="white" />
			</clipPath>
		</defs>
	</svg>

);
