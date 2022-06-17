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

import * as Yup from 'yup';
import { AdvancedSettingsSchema } from './settingsSchemes';
import {
	containerName,
	containerType,
	containerUnit,
	containerCode,
	containerDesc,
	revisionDesc,
	revisionTag,
} from './validators';

export const ContainerSettingsSchema = AdvancedSettingsSchema.shape({ type: Yup.string() });

export const CreateContainerSchema = Yup.object().shape({
	name: containerName,
	unit: containerUnit,
	type: containerType,
	code: containerCode,
	desc: containerDesc,
});

export const ListItemSchema = Yup.object().shape({
	revisionTag,
	containerName,
});

export const SidebarSchema = Yup.object().shape({
	containerUnit,
	containerType,
	containerCode,
	containerDesc,
	revisionDesc,
});

export const UploadsSchema = Yup.object().shape({
	uploads: Yup
		.array()
		.of(ListItemSchema.concat(SidebarSchema))
		.required()
		.min(1),
});
