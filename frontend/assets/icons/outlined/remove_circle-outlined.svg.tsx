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
	<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path
			fillRule="evenodd"
			clipRule="evenodd" 
			d="M9 16.7344C13.2716 16.7344 16.7344 13.2716 16.7344 9C16.7344 4.72842 13.2716 1.26562 9 1.26562C4.72842 1.26562 1.26563 4.72842 1.26563 9C1.26563 13.2716 4.72842 16.7344 9 16.7344ZM9 18C13.9706 18 18 13.9706 18 9C18 4.02944 13.9706 -7.7727e-07 9 -5.00726e-07C4.02944 -2.24183e-07 2.24183e-07 4.02944 5.00726e-07 9C7.7727e-07 13.9706 4.02944 18 9 18Z"
			fill="currentColor"
		/>
		<path
			fillRule="evenodd"
			clipRule="evenodd" 
			d="M12.5703 9.00879C12.5703 9.35828 12.287 9.6416 11.9375 9.6416L6.06641 9.6416C5.71691 9.6416 5.43359 9.35828 5.43359 9.00879C5.43359 8.6593 5.71691 8.37598 6.06641 8.37598L11.9375 8.37598C12.287 8.37598 12.5703 8.6593 12.5703 9.00879Z"
			fill="currentColor"
		/>
	</svg>
);
