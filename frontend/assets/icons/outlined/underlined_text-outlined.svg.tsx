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
	<svg className={className} width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M3.65234 1.38281C3.65234 1.03332 3.36902 0.75 3.01953 0.75C2.67004 0.75 2.38672 1.03332 2.38672 1.38281V6.62109C2.38672 8.8928 4.2283 10.7344 6.5 10.7344C8.7717 10.7344 10.6133 8.8928 10.6133 6.62109V1.38281C10.6133 1.03332 10.33 0.75 9.98047 0.75C9.63097 0.75 9.34765 1.03332 9.34765 1.38281V6.62109C9.34765 8.19381 8.07271 9.46875 6.5 9.46875C4.92728 9.46875 3.65234 8.19381 3.65234 6.62109V1.38281Z" fill="currentColor"/>
		<path d="M1.27929 12.9585C0.929802 12.9585 0.646483 13.2418 0.646484 13.5913C0.646486 13.9408 0.929807 14.2241 1.2793 14.2241H11.7383C12.0878 14.2241 12.3711 13.9408 12.3711 13.5913C12.3711 13.2418 12.0878 12.9585 11.7383 12.9585H1.27929Z" fill="currentColor"/>
	</svg>
);