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
		width="12"
		height="22"
		viewBox="0 0 12 22"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className={className}
	>
		<path
			d="M7.41394 22V11.9811H10.7939L11.2963 8.05836H7.41394V5.55975C7.41394 4.42779 7.72933 3.65278 9.35392 3.65278H11.4125V0.155454C10.4109 0.0481145 9.40409 -0.00371372 8.39677 0.000206791C5.40918 0.000206791 3.35797 1.82405 3.35797 5.17224V8.05103H0V11.9738H3.36531V22H7.41394Z"
			fill="currentColor"
		/>
	</svg>
);
