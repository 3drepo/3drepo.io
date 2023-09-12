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
};

export default ({ className }: IProps) => (
	<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="26 93 78 78">
		<path
			fill="none"
			stroke="currentColor"
			d="M 30,167 V 117 H 80 30 L 55,97 h 45 l -20,20 20,-20 v 45 l -20,25 v -50 50 z"
			strokeWidth="8"
			strokeLinecap="butt"
			strokeLinejoin="round"
			strokeOpacity="1"
			strokeMiterlimit="4"
			strokeDasharray="none"
		/>
		<path
			fill="none"
			stroke="currentColor"
			d="m 30,167 25,-25 45,0 -45,0 V 96.999998"
			strokeWidth="4"
			strokeLinecap="butt"
			strokeLinejoin="round"
			strokeOpacity="1"
			strokeMiterlimit="4"
			strokeDasharray="12.00000033, 12.00000033000000066"
			strokeDashoffset="0"
		/>
	</svg>
);
