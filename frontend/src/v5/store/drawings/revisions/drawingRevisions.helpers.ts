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
import { CreateDrawingRevisionBody, IDrawingRevision } from './drawingRevisions.types';
import { NewDrawing } from '../drawings.types';
import { getUrl } from '@/v5/services/api/default';

export const prepareRevisionData = (revision): IDrawingRevision => ({
	...revision,
	timestamp: getNullableDate(revision.timestamp),
	name: revision?.name || '',
	author: revision?.author || '',
	desc: revision?.desc || '',
	revCode: revision?.revCode || '',
	void: revision?.void || false,
});

export const createDrawingFromRevisionBody = (body: CreateDrawingRevisionBody): Omit<NewDrawing, '_id'> => ({
	name: body.drawingName,
	number: body.drawingNumber,
	type: body.drawingType,
	desc: body.drawingDesc,
	calibration: body.calibration,
});

export const createFormDataFromRevisionBody = (body: CreateDrawingRevisionBody) => {
	const formData = new FormData();
	formData.append('file', body.file);
	formData.append('revCode', body.revCode);
	formData.append('statusCode', body.statusCode);
	if (body.revisionDesc) formData.append('desc', body.revisionDesc);
	return formData;
};

export const getDrawingImageSrc = (teamspace, projectId, drawingId, revision) => getUrl(`teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}/revisions/${revision}/files/image`);
