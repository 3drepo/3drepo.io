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

import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { STATUS_TYPE_MAP } from './chip.types';
import { useParams } from 'react-router-dom';

export const getStatusChipProps = (templateId, value) => {
	const { containerOrFederation } = useParams();
	const statusConfig = TicketsHooksSelectors.selectStatusConfigByTemplateId(containerOrFederation, templateId);
	const { type, label = value } = statusConfig.values.find(({ name }) => name === value);
	return { label, value, ...STATUS_TYPE_MAP[type] };
};

export const getStatusPropertyValues = (templateId) => {
	const { containerOrFederation } = useParams();
	const values = TicketsHooksSelectors.selectStatusConfigByTemplateId(containerOrFederation, templateId)?.values;
	return values.reduce((acc, { name }) => {
		acc[name] = getStatusChipProps(templateId, name);
		return acc;
	}, {});
};
