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
			d="M92.4749 7.52513C91.108 6.15829 88.892 6.15829 87.5251 7.52513L57.8405 37.2098C55.559 35.8082 52.8739 35 50 35C47.1261 35 44.441 35.8082 42.1595 37.2098L12.4749 7.52513C11.108 6.15829 8.89196 6.15829 7.52513 7.52513C6.1583 8.89196 6.1583 11.108 7.52513 12.4749L37.2098 42.1595C35.8082 44.441 35 47.1261 35 50C35 52.8739 35.8082 55.559 37.2098 57.8405L7.52513 87.5251C6.15829 88.892 6.15829 91.108 7.52513 92.4749C8.89196 93.8417 11.108 93.8417 12.4749 92.4749L42.1595 62.7902C44.441 64.1918 47.1261 65 50 65C52.8739 65 55.559 64.1918 57.8405 62.7902L87.5251 92.4749C88.892 93.8417 91.108 93.8417 92.4749 92.4749C93.8417 91.108 93.8417 88.892 92.4749 87.5251L62.7902 57.8405C64.1918 55.559 65 52.8739 65 50C65 47.1261 64.1918 44.441 62.7902 42.1595L92.4749 12.4749C93.8417 11.108 93.8417 8.89196 92.4749 7.52513Z"
			fill="currentColor" 
		/>
	</svg>
);