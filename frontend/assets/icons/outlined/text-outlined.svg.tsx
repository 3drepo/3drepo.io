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
};

export default ({ className }: IProps) => (
	<svg className={className} width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M0.609375 1.38362C0.609375 1.03368 0.892695 0.75 1.24219 0.75H13.7578C13.9256 0.75 14.0866 0.816756 14.2053 0.935583C14.324 1.05441 14.3906 1.21557 14.3906 1.38362V3.47222C14.3906 3.82216 14.1073 4.10584 13.7578 4.10584C13.4083 4.10584 13.125 3.82216 13.125 3.47222V2.01724H8.13281V12.9812H9.58594C9.93543 12.9812 10.2187 13.2648 10.2187 13.6148C10.2187 13.9647 9.93543 14.2484 9.58594 14.2484H5.41406C5.06457 14.2484 4.78125 13.9647 4.78125 13.6148C4.78125 13.2648 5.06457 12.9812 5.41406 12.9812H6.86719V2.01724H1.875V3.47222C1.875 3.82216 1.59168 4.10584 1.24219 4.10584C0.892695 4.10584 0.609375 3.82216 0.609375 3.47222V1.38362Z" fill="currentColor"/>
	</svg>
);
