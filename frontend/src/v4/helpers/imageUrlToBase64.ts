/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { Buffer } from 'buffer';
import api from '../services/api/';

const imageUrlToBase64 = (url: string) => api
	.get((url.split('/api/')[1]), {
		responseType: 'arraybuffer'
	})
	.then((response) =>
		Buffer.from(response.data, 'binary').toString('base64'));

const BASE_64_PREFIX = 'data:image/png;base64,';

export const imageUrlToBase64IfNotAlready = async (image: string) => {
	if (image?.startsWith(BASE_64_PREFIX)) {
		return image;
	}
	return BASE_64_PREFIX + await imageUrlToBase64(image);
};
