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

import { getNullableDate } from '@/v5/helpers/getNullableDate';
import { CreateRevisionBody, IDrawingRevision } from './drawingRevisions.types';

export const prepareRevisionData = (revision): IDrawingRevision => ({
	...revision,
	timestamp: getNullableDate(revision.timestamp),
	tag: revision?.tag || '',
	author: revision?.author || '',
	desc: revision?.desc || '',
	void: revision?.void || false,
});

export const createContainerFromRevisionBody = (body: CreateRevisionBody) => ({
	...body,
	// desc: body.containerDesc,
	// name: body.containerName,
	// unit: body.containerUnit,
	// type: body.containerType,
	// code: body.containerCode,
});

export const createFormDataFromRevisionBody = (body: CreateRevisionBody) => {
	const formData = new FormData();
	formData.append('file', body.file);
	formData.append('revisionCode', body.revisionCode);
	formData.append('statusCode', body.statusCode);
	if (body.description) formData.append('desc', body.description);
	return formData;
};
