/**
 *  Copyright (C) 2022 3D Repo Ltd
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
	<svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path fillRule="evenodd" clipRule="evenodd" d="M9 4.31641C6.76713 4.31641 4.95703 6.1265 4.95703 8.35938C4.95703 10.5922 6.76713 12.4023 9 12.4023C11.2329 12.4023 13.043 10.5922 13.043 8.35938C13.043 6.1265 11.2329 4.31641 9 4.31641ZM6.36328 8.35938C6.36328 6.90316 7.54378 5.72266 9 5.72266C10.4562 5.72266 11.6367 6.90316 11.6367 8.35938C11.6367 9.81559 10.4562 10.9961 9 10.9961C7.54378 10.9961 6.36328 9.81559 6.36328 8.35938Z" fill="currentColor"/>
		<path fillRule="evenodd" clipRule="evenodd" d="M9.00627 0C6.81088 0 4.74251 0.83511 3.18707 2.35214L3.18664 2.35257C1.63612 3.86741 0.777344 5.8841 0.777344 8.03075C0.777344 11.292 2.35853 14.004 4.09256 16.0007C5.82936 18.0005 7.77302 19.346 8.62901 19.8902C8.85922 20.0366 9.15332 20.0366 9.38353 19.8902C10.2395 19.346 12.1832 18.0005 13.92 16.0007C15.654 14.004 17.2352 11.292 17.2352 8.03075C17.2352 5.88426 16.3765 3.86734 14.8256 2.35475L14.8254 2.35463C13.2699 0.835001 11.2015 0 9.00627 0ZM4.1692 3.35861C5.45848 2.10129 7.17298 1.40625 9.00627 1.40625C10.8396 1.40625 12.554 2.10132 13.8432 3.36093L13.8436 3.36139C15.1273 4.61327 15.8289 6.26889 15.8289 8.03075C15.8289 10.8228 14.4738 13.2183 12.8582 15.0786C11.464 16.6841 9.91537 17.844 9.00627 18.4564C8.09717 17.844 6.54859 16.6841 5.15431 15.0786C3.53872 13.2183 2.18359 10.8228 2.18359 8.03075C2.18359 6.26907 2.88511 4.61324 4.1692 3.35861Z" fill="currentColor"/>
	</svg>

);
