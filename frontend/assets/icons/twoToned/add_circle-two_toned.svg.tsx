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

export default ({ fillColour, className }: IProps) => (
	<svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<circle cx="16.6336" cy="15.8616" r="15.8616" fill="currentColor" />
		<path d="M16.6337 9.33063V22.3931" stroke={fillColour} strokeWidth="2" />
		<path d="M16.6337 9.33063V22.3931" stroke={fillColour} strokeWidth="2" />
		<path d="M23.1649 15.8619L10.1024 15.8619" stroke={fillColour} strokeWidth="2" />
		<path d="M23.1649 15.8619L10.1024 15.8619" stroke={fillColour} strokeWidth="2" />
	</svg>
);
