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

import { clientConfigService } from '@/v4/services/clientConfig';
import { downloadAuthUrl } from '@/v5/helpers/download.helper';

export const stripBase64Prefix = (base64name) => base64name.replace('data:', '').replace(/^.+,/, '');
export const addBase64Prefix = (value, imageType = 'png') => `data:image/${imageType};base64,${value}`;

export const convertFileToImageSrc = (file) => new Promise<string>((resolve) => {
	const reader = new FileReader();
	reader.onloadend = () => resolve(reader.result as string);
	reader.readAsDataURL(file);
});

export const getSupportedImageExtensions = () => clientConfigService.imageExtensions.map((x) => `.${x}`).join(',');

export const testImageExists = async (src: string) => {
	const authSrc = await downloadAuthUrl(src);
	const img = new Image();
	const imgPromise = new Promise((resolve, reject) => {
		img.onload = resolve;
		img.onerror = reject;
	});

	img.src = authSrc;
	await imgPromise;
	return authSrc;
};
