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
		xmlns="http://www.w3.org/2000/svg"
		width="12"
		height="12"
		viewBox="0 0 12 12"
		fill="none"
		className={className}
	>
		<path
			d="M11.52 1.08H9V0.12C9 0.054 8.946 0 8.88 0H8.04C7.974 0 7.92 0.054 7.92 0.12V1.08H4.08V0.12C4.08 0.054 4.026 0 3.96 0H3.12C3.054 0 3 0.054 3 0.12V1.08H0.48C0.2145 1.08 0 1.2945 0 1.56V11.52C0 11.7855 0.2145 12 0.48 12H11.52C11.7855 12 12 11.7855 12 11.52V1.56C12 1.2945 11.7855 1.08 11.52 1.08ZM10.92 10.92H1.08V5.22H10.92V10.92ZM1.08 4.2V2.16H3V2.88C3 2.946 3.054 3 3.12 3H3.96C4.026 3 4.08 2.946 4.08 2.88V2.16H7.92V2.88C7.92 2.946 7.974 3 8.04 3H8.88C8.946 3 9 2.946 9 2.88V2.16H10.92V4.2H1.08Z"
			fill="currentColor"
		/>
	</svg>
);
