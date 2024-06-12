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
		<path fillRule="evenodd" clipRule="evenodd" d="M7.59375 0.703125C7.59375 0.3148 7.90855 0 8.29688 0C8.6852 0 9 0.3148 9 0.703125V19.2969C9 19.6852 8.6852 20 8.29688 20C7.90855 20 7.59375 19.6852 7.59375 19.2969V18.7305H3.70703C1.76541 18.7305 0.191406 17.1565 0.191406 15.2148V4.78515C0.191406 2.84352 1.76541 1.26952 3.70703 1.26952C4.93219 1.23484 6.63163 1.24733 7.59375 1.25887V0.703125ZM7.59375 17.3242V9.94612L1.61718 15.503C1.75771 16.5317 2.63981 17.3242 3.70703 17.3242H7.59375Z" fill="currentColor"/>
		<path d="M14.2148 18.7305H10.4062V9.05159L16.3242 14.5603V4.78516C16.3242 3.62018 15.3798 2.67578 14.2148 2.67578H10.4062V1.26953H14.2148C16.1565 1.26953 17.7305 2.84353 17.7305 4.78516V15.2148C17.7305 17.1565 16.1565 18.7305 14.2148 18.7305Z" fill="currentColor"/>
	</svg>
);
