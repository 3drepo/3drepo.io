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
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="96 193 78 78" className={className}>
		<path
			fill="none"
			stroke="currentColor"
			d="m 100,267 v -50 h 50 -50 l 50,-20 h 20 l -20,20 20,-20 v 20 l -20,50 v -50 50 z"
			strokeWidth="8"
			strokeLinecap="butt"
			strokeLinejoin="round"
			strokeMiterlimit="4"
			strokeDasharray="none"
			strokeOpacity="1"
		/>
		<path
			fill="none"
			stroke="currentColor"
			d="m 100,267 50,-50 h 20 -20 v -20"
			strokeWidth="4"
			strokeLinecap="butt"
			strokeLinejoin="round"
			strokeMiterlimit="4"
			strokeDasharray="12.00000033, 12.00000033"
			strokeDashoffset="0"
			strokeOpacity="1"
		/>
	</svg>
);
