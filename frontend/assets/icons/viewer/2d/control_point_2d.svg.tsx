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

import { IProps } from '@assets/icons/icons.types';

export default ({ className, ...rest }: IProps) => (
	<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...rest} >
		<path
			d="M50 65C58.2843 65 65 58.2843 65 50C65 41.7157 58.2843 35 50 35C41.7157 35 35 41.7157 35 50C35 58.2843 41.7157 65 50 65Z"
			fill="currentColor"
		/>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M5 12C5 8.68629 7.68629 6 11 6H89C92.3137 6 95 8.68629 95 12V90C95 93.3137 92.3137 96 89 96H11C7.68629 96 5 93.3137 5 90V12ZM12 89V13H88V89H12Z"
			fill="currentColor"
		/>
	</svg>
);
