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
			d="M0.158176 8.60229C2.25342 6.00916 4.93359 2.79492 9.00001 2.79492C13.0664 2.79492 15.7466 6.00912 17.8418 8.6023C18.012 8.81295 18.0293 9.10855 17.8848 9.3376C16.972 10.7848 15.6942 12.2403 14.1837 13.3395C12.6745 14.4377 10.8973 15.2051 9.00001 15.2051C7.10274 15.2051 5.32554 14.4377 3.81628 13.3395C2.30577 12.2403 1.028 10.7848 0.115159 9.3376C-0.0293216 9.10854 -0.0120279 8.81294 0.158176 8.60229ZM9 5.67773C7.16516 5.67773 5.67773 7.16516 5.67773 9C5.67773 10.8348 7.16516 12.3223 9 12.3223C10.8348 12.3223 12.3223 10.8348 12.3223 9C12.3223 7.16516 10.8348 5.67773 9 5.67773Z"
			fill="currentColor"
		/>
		<path
			d="M6.94336 9C6.94336 7.86415 7.86415 6.94336 9 6.94336C10.1359 6.94336 11.0566 7.86415 11.0566 9C11.0566 10.1359 10.1359 11.0566 9 11.0566C7.86415 11.0566 6.94336 10.1359 6.94336 9Z"
			fill="currentColor"
		/>
	</svg>
);
