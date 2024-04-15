/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { generateV5ApiUrl } from '@/v5/services/api/default';
import { formatInfoUnit } from '@/v5/helpers/intl.helper';

export const DEFAULT_PROJECT_IMAGE = 'assets/images/default_background.png';

export const getProjectImgSrc = (teamspace: string, project: string) => (
	generateV5ApiUrl(`teamspaces/${teamspace}/projects/${project}/image`, clientConfigService.GET_API)
);

export const projectImageFileIsTooBig = (file): boolean => (file.size > clientConfigService.projectImageSizeLimit);
export const PROJECT_IMAGE_MAX_SIZE_MESSAGE = formatInfoUnit(clientConfigService.projectImageSizeLimit);

export enum ModelType {
	CONTAINER,
	FEDERATION,
	DRAWING,
}

export const getModelType = (model) => {
	if (model.federate) return ModelType.FEDERATION;
	if (model.drawingNumber) return ModelType.DRAWING;
	return ModelType.CONTAINER;
};
