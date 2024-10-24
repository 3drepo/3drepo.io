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

import { imageIsTooBig } from '@/v5/store/tickets/comments/ticketComments.helpers';
import { convertFileToImageSrc, getSupportedImageExtensions, testImageExists } from './imageFile.helper';
import { uploadFile } from './uploadFile';
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { formatMessage } from '@/v5/services/intl';
import { clientConfigService } from '@/v4/services/clientConfig';

export const uploadImages = async (onUpload: (images: string[]) => void) => {
	const files = await uploadFile(getSupportedImageExtensions(), true) as File[];
	const imagesToUpload = [];
	let corruptedImagesCount = 0;
	let imagesTooBigCount = 0;
	for (const file of files) {
		if (imageIsTooBig(file)) {
			imagesTooBigCount++;
			continue;
		}
		try {
			const imgSrc = await convertFileToImageSrc(file) as string;
			await testImageExists(imgSrc);
			imagesToUpload.push(imgSrc);
		} catch (e) {
			corruptedImagesCount++;
		}
	}
	if (imagesToUpload.length) {
		onUpload(imagesToUpload);
	}
	if (imagesTooBigCount) {
		DialogsActionsDispatchers.open('warning', {
			title: formatMessage({
				defaultMessage: 'Max file size exceeded',
				id: 'uploadImages.error.imageTooBig.title',
			}),
			message: formatMessage({
				defaultMessage: `
					{imagesTooBigCount} {imagesTooBigCount, plural, one {file was} other {files were}} too big and could not be uploaded.
					The max file size is {maxFileSize}`,
				id: 'uploadImages.error.imageTooBig.message',
			}, { imagesTooBigCount, maxFileSize: clientConfigService.resourceUploadSizeLimit }),
		});
	}
	if (corruptedImagesCount) {
		DialogsActionsDispatchers.open('warning', {
			title: formatMessage({
				defaultMessage: 'Invalid images',
				id: 'uploadImages.error.corruptedImage.title',
			}),
			message: formatMessage({
				defaultMessage: '{corruptedImagesCount} {corruptedImagesCount, plural, one {file was} other {files were}} corrupted and could not be uploaded.',
				id: 'uploadImages.error.corruptedImage.message',
			}, { corruptedImagesCount }),
		});
	}
};