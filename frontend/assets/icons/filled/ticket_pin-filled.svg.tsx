/**
 *  Copyright (C) 2023 3D Repo Ltd
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
	selected
};

export default ({ className }: IProps) => (
	<svg width="50" height="64" viewBox="0 0 50 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path id="selectionFill" stroke-width="0" d="M 7.3534566,14.021421 H 42.562804 V 26.360273 H 6.6056475 V 13.959104 Z" fill="0"/>
		<path fillRule="evenodd" clipRule="evenodd" d="M0 8C0 3.58172 3.58172 0 8 0H42C46.4183 0 50 3.58172 50 8V41C50 45.4183 46.4183 49 42 49H32L26 64L20 49H8C3.58172 49 0 45.4183 0 41V8ZM10.0002 14.5C10.0002 13.1193 11.1195 12 12.5002 12H37.5002C38.8809 12 40.0002 13.1193 40.0002 14.5C40.0002 15.8807 38.8809 17 37.5002 17H12.5002C11.1195 17 10.0002 15.8807 10.0002 14.5ZM16.0294 23.9999C14.6487 23.9999 13.5294 25.1192 13.5294 26.4999C13.5294 27.8806 14.6487 28.9999 16.0294 28.9999H33.9706C35.3513 28.9999 36.4706 27.8806 36.4706 26.4999C36.4706 25.1192 35.3513 23.9999 33.9706 23.9999H16.0294Z" fill="currentColor"/>
	</svg>
);
