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
			fillRule="evenodd"
			clipRule="evenodd"
			d="M92.4749 7.52513C91.108 6.15829 88.892 6.15829 87.5251 7.52513L63.0251 32.0252L53.2855 22.2856C50.9423 19.9425 47.1434 19.9425 44.8002 22.2856L36.0178 31.068L12.4749 7.52513C11.108 6.15829 8.89197 6.15829 7.52513 7.52513C6.1583 8.89196 6.1583 11.108 7.52513 12.4749L31.068 36.0178L20.5178 46.5681C18.1746 48.9112 18.1746 52.7102 20.5178 55.0533L30.2573 64.7929L7.52513 87.5251C6.15829 88.892 6.15829 91.108 7.52513 92.4749C8.89196 93.8417 11.108 93.8417 12.4749 92.4749L35.2071 69.7427L44.8002 79.3358C47.1434 81.6789 50.9424 81.6789 53.2855 79.3358L63.8358 68.7855L87.5251 92.4749C88.892 93.8417 91.108 93.8417 92.4749 92.4749C93.8417 91.108 93.8417 88.892 92.4749 87.5251L68.7855 63.8358L77.5679 55.0533C79.9111 52.7102 79.9111 48.9112 77.5679 46.5681L67.9748 36.9749L92.4749 12.4749C93.8417 11.108 93.8417 8.89196 92.4749 7.52513ZM58.0753 36.9749L49.0429 27.9425L40.9675 36.0178L50 45.0502L58.0753 36.9749ZM36.0178 40.9675L26.1746 50.8107L35.2071 59.8432L45.0503 50L36.0178 40.9675ZM40.1568 64.7929L49.0429 73.6789L58.886 63.8358L50 54.9497L40.1568 64.7929ZM63.8358 58.886L54.9498 50L63.0251 41.9247L71.9111 50.8107L63.8358 58.886Z"
			fill="currentColor"
		/>
	</svg>
);
