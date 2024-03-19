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
	<svg className={className} width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fillRule="evenodd" clipRule="evenodd" d="M7.17742 12.343C6.98757 12.5329 6.74225 12.6574 6.47694 12.6987L2.79112 13.2718L3.36422 9.58596C3.40547 9.32065 3.53003 9.07533 3.71989 8.88548L11.5581 1.04733C12.0482 0.557166 12.8415 0.552514 13.3374 1.03689L15.0246 2.685C15.5288 3.17748 15.5335 3.98694 15.0352 4.4853L7.17742 12.343ZM12.453 1.94226L14.1402 3.59037L6.28249 11.4481L4.30778 11.7551L4.61482 9.78041L12.453 1.94226Z" fill="currentColor"/>
		<path d="M1.00198 15.8289C4.29315 17.283 7.0055 16.2746 9.2887 15.4257L9.28978 15.4253C9.39157 15.3875 9.49251 15.35 9.5926 15.313C10.7915 14.8701 11.8362 14.5162 12.8591 14.4972C13.8402 14.479 14.8389 14.7707 15.932 15.7264C16.1951 15.9565 16.5949 15.9297 16.8249 15.6666C17.055 15.4034 17.0282 15.0037 16.7651 14.7736C15.4456 13.62 14.1448 13.2075 12.8356 13.2318C11.5681 13.2554 10.3315 13.6908 9.15405 14.1258C9.0762 14.1545 8.99843 14.1833 8.92072 14.2121C6.59585 15.0735 4.32672 15.9142 1.51347 14.6712C1.19379 14.5299 0.820138 14.6746 0.678894 14.9943C0.537651 15.314 0.682304 15.6876 1.00198 15.8289Z" fill="currentColor"/>
	</svg>
);