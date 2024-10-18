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

import axios from 'axios';
import { isApiUrl } from '../services/api/default';

const CachedURL: Record<string, string>  = {};

export const downloadAuthUrl = async (url):Promise<string> => {
	if ( !isApiUrl(url) ) return url;

	if (!CachedURL[url]) {
		const response = await axios.get(url, { responseType: 'blob' });
		CachedURL[url] = URL.createObjectURL(response.data);
	}

	return CachedURL[url];
};

export const deleteAuthUrlFromCache = (url) => delete CachedURL[url];

export const downloadFile = async (url: string, fileName?: string) => {
	const urlParts = new URL(url).pathname.split('/');
	const urlFileName = urlParts[urlParts.length - 1];
	const anchor = document.createElement('a');
	anchor.href = await downloadAuthUrl(url) ;
	anchor.download = fileName || urlFileName;
	anchor.click();
};