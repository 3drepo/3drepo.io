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
	<svg
		width="36"
		height="36"
		viewBox="0 0 36 36"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className={className}
	>
		<path
			d="M30.8573 16.0765H28.1252V7.07645C28.1252 4.23583 25.8229 1.93359 22.9823 1.93359H13.018C10.1774 1.93359 7.87515 4.23583 7.87515 7.07645V16.0765H5.14301C4.43185 16.0765 3.85729 16.651 3.85729 17.3622V32.7907C3.85729 33.5019 4.43185 34.0765 5.14301 34.0765H30.8573C31.5685 34.0765 32.143 33.5019 32.143 32.7907V17.3622C32.143 16.651 31.5685 16.0765 30.8573 16.0765ZM10.768 7.07645C10.768 5.83493 11.7765 4.82645 13.018 4.82645H22.9823C24.2238 4.82645 25.2323 5.83493 25.2323 7.07645V16.0765H10.768V7.07645ZM29.2502 31.1836H6.75015V18.9693H29.2502V31.1836ZM16.8752 25.5988V27.7282C16.8752 27.905 17.0198 28.0497 17.1966 28.0497H18.8037C18.9805 28.0497 19.1252 27.905 19.1252 27.7282V25.5988C19.4568 25.3607 19.7044 25.0234 19.8322 24.6357C19.96 24.2479 19.9615 23.8296 19.8364 23.4409C19.7113 23.0523 19.4661 22.7133 19.1362 22.4729C18.8062 22.2324 18.4084 22.1029 18.0002 22.1029C17.5919 22.1029 17.1941 22.2324 16.8641 22.4729C16.5342 22.7133 16.289 23.0523 16.1639 23.4409C16.0388 23.8296 16.0403 24.2479 16.1681 24.6357C16.2959 25.0234 16.5435 25.3607 16.8752 25.5988Z"
			fill="currentColor"
		/>
	</svg>
);
