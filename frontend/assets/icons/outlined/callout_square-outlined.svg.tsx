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
	<svg className={className} width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fillRule="evenodd" clipRule="evenodd" d="M12.5176 0.5C11.7021 0.5 11.041 1.16108 11.041 1.97656V3.125H1.97656C1.16108 3.125 0.5 3.78608 0.5 4.60156V20.0234C0.5 20.8389 1.16108 21.5 1.97656 21.5H17.3984C18.2139 21.5 18.875 20.8389 18.875 20.0234V10.959H20.0234C20.8389 10.959 21.5 10.2979 21.5 9.48242V1.97656C21.5 1.16108 20.8389 0.5 20.0234 0.5H12.5176ZM20.0234 1.97656H12.5176V9.48242H20.0234V1.97656ZM1.97656 4.60156H11.041V9.85339L5.92522 14.9692C5.63691 15.2575 5.63691 15.725 5.92522 16.0133C6.21354 16.3016 6.68099 16.3016 6.96931 16.0133L12.0236 10.959H17.3984V20.0234H1.97656L1.97656 4.60156Z" fill="currentColor"/>
	</svg>
);
