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
	<svg xmlns="http://www.w3.org/2000/svg" width="13" height="8" viewBox="0 0 13 8" fill="none" className={className}>
		<path
			d="M6.02308 0C2.69834 0 0 1.34917 0 3.01154C0 4.36071 1.77078 5.49907 4.21615 5.88455V7.83L6.62538 5.42077L4.21615 3.01154V4.65584C2.31888 4.31855 1.20462 3.51145 1.20462 3.01154C1.20462 2.37309 3.03563 1.20462 6.02308 1.20462C9.01052 1.20462 10.8415 2.37309 10.8415 3.01154C10.8415 3.45122 9.96217 4.1499 8.43231 4.53538V5.77011C10.5585 5.30633 12.0462 4.24627 12.0462 3.01154C12.0462 1.34917 9.34782 0 6.02308 0Z"
			fill="currentColor"
		/>
	</svg>
);
