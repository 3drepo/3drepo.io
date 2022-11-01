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
	<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none" className={className}>
		<path
			d="M8.83584 6.09435H6.90615V4.16466C6.90615 4.1088 6.86045 4.0631 6.80459 4.0631H6.19521C6.13935 4.0631 6.09365 4.1088 6.09365 4.16466V6.09435H4.16396C4.1081 6.09435 4.0624 6.14005 4.0624 6.19591V6.80528C4.0624 6.86114 4.1081 6.90685 4.16396 6.90685H6.09365V8.83653C6.09365 8.89239 6.13935 8.9381 6.19521 8.9381H6.80459C6.86045 8.9381 6.90615 8.89239 6.90615 8.83653V6.90685H8.83584C8.8917 6.90685 8.9374 6.86114 8.9374 6.80528V6.19591C8.9374 6.14005 8.8917 6.09435 8.83584 6.09435Z"
			fill="currentColor"
		/>
		<path
			d="M6.5 0.8125C3.35918 0.8125 0.8125 3.35918 0.8125 6.5C0.8125 9.64082 3.35918 12.1875 6.5 12.1875C9.64082 12.1875 12.1875 9.64082 12.1875 6.5C12.1875 3.35918 9.64082 0.8125 6.5 0.8125ZM6.5 11.2227C3.89238 11.2227 1.77734 9.10762 1.77734 6.5C1.77734 3.89238 3.89238 1.77734 6.5 1.77734C9.10762 1.77734 11.2227 3.89238 11.2227 6.5C11.2227 9.10762 9.10762 11.2227 6.5 11.2227Z"
			fill="currentColor"
		/>
	</svg>
);
