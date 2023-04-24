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
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See th
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

type IProps = {
	className?: any;
};

export default ({ className }: IProps) => (
	<svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M15.0315 2.38764L3.01068 14.4084L2.21484 13.6126L14.2357 1.5918L15.0315 2.38764Z"
			fill="currentColor"
		/>
		<path
			d="M16.3335 7.53246C14.6399 3.96485 12.0798 2.16943 8.64799 2.16943C5.21437 2.16943 2.65612 3.96485 0.962536 7.53425C0.894606 7.67809 0.859375 7.83519 0.859375 7.99427C0.859375 8.15334 0.894606 8.31044 0.962536 8.45429C2.65612 12.0219 5.21616 13.8173 8.64799 13.8173C12.0816 13.8173 14.6399 12.0219 16.3335 8.4525C16.471 8.16309 16.471 7.82723 16.3335 7.53246ZM8.64799 12.531C5.76639 12.531 3.65655 11.0697 2.16841 7.99337C3.65655 4.91705 5.76639 3.4557 8.64799 3.4557C11.5296 3.4557 13.6394 4.91705 15.1276 7.99337C13.6412 11.0697 11.5314 12.531 8.64799 12.531ZM8.57653 4.84916C6.84007 4.84916 5.43232 6.25691 5.43232 7.99337C5.43232 9.72984 6.84007 11.1376 8.57653 11.1376C10.313 11.1376 11.7207 9.72984 11.7207 7.99337C11.7207 6.25691 10.313 4.84916 8.57653 4.84916ZM8.57653 9.99424C7.4707 9.99424 6.57567 9.09921 6.57567 7.99337C6.57567 6.88754 7.4707 5.99251 8.57653 5.99251C9.68237 5.99251 10.5774 6.88754 10.5774 7.99337C10.5774 9.09921 9.68237 9.99424 8.57653 9.99424Z"
			fill="currentColor"
		/>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M3.01251 16L0.625 13.6125L14.2375 0L16.625 2.38751L3.01251 16ZM14.2375 1.59168L15.0333 2.38751L3.01251 14.4083L2.21668 13.6125L14.2375 1.59168Z"
			fill="transparent"
		/>
	</svg>
);
