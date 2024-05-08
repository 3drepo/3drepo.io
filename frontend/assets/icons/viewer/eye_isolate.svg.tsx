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
			d="M9.00002 2.79492C4.93359 2.79492 2.25342 6.00916 0.158176 8.60229C-0.0120279 8.81294 -0.0293216 9.10854 0.115159 9.3376C1.028 10.7848 2.30577 12.2403 3.81629 13.3395C5.32554 14.4377 7.10274 15.2051 9.00002 15.2051C10.8973 15.2051 12.6745 14.4377 14.1837 13.3395C15.6942 12.2403 16.972 10.7848 17.8848 9.3376C18.0293 9.10855 18.012 8.81295 17.8418 8.6023C15.7466 6.00912 13.0664 2.79492 9.00002 2.79492ZM4.56098 12.3161C3.32625 11.4176 2.24859 10.2419 1.43287 9.04008C3.52029 6.48199 5.77885 4.06055 9.00002 4.06055C12.2212 4.06055 14.4798 6.48196 16.5671 9.04008C15.7514 10.2419 14.6738 11.4176 13.439 12.3161C12.0739 13.3095 10.5524 13.9395 9.00002 13.9395C7.44768 13.9395 5.92612 13.3095 4.56098 12.3161Z"
			fill="currentColor"
		/>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M9 6.50391C7.62145 6.50391 6.50391 7.62145 6.50391 9C6.50391 10.3786 7.62145 11.4961 9 11.4961C10.3786 11.4961 11.4961 10.3786 11.4961 9C11.4961 7.62145 10.3786 6.50391 9 6.50391Z"
			fill="currentColor"
		/>
	</svg>
);
