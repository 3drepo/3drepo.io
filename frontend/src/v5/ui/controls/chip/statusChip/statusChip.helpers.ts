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

import { STATUS_TYPE_MAP } from '../chip.types';

export const getChipPropsFromConfig = (statusConfig, value) => {
	const valueProps = statusConfig.values.find(({ name }) => name === value);
	if (!valueProps) return {};
	const { type, label = value } = valueProps;
	return { label, value, ...STATUS_TYPE_MAP[type] };
};

export const getStatusPropertyValues = (statusConfig) => statusConfig.values.reduce((acc, { name }) => {
	acc[name] = getChipPropsFromConfig(statusConfig, name);
	return acc;
}, {});
