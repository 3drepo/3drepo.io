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
	className?: string,
};

export default ({ className }: IProps) => (
	<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" className={className}>
		<g clipPath="url(#clip0_1244_11677)">
			<rect width="1024" height="1024" fill="none" />
			<circle cx="512" cy="512" r="476" stroke="currentColor" strokeWidth="72" />
			<path
				d="M403 684.679V345.252C403 314.77 438.518 298.083 461.981 317.542L673.063 492.601C690.769 507.285 690.349 534.582 672.199 548.715L461.118 713.083C437.474 731.495 403 714.646 403 684.679Z"
				stroke="currentColor"
				strokeWidth="72"
			/>
		</g>
		<defs>
			<clipPath id="clip0_1244_11677">
				<rect width="1024" height="1024" fill="none" />
			</clipPath>
		</defs>
	</svg>
);
