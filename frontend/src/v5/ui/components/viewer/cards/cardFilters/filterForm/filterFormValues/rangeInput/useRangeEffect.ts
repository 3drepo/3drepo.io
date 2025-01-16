/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { get } from 'lodash';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

export const useRangeEffect = ({ formError, name }) => {
	const { trigger, getValues, formState: { dirtyFields } } = useFormContext();

	const triggerFieldIfDirtyOrNotEmpty = (fieldName) => {
		if (get(dirtyFields, fieldName) || getValues(fieldName)) {
			trigger(fieldName);
		}
	};

	useEffect(() => {
		triggerFieldIfDirtyOrNotEmpty(`${name}.1`);
	}, [formError?.[0]?.message]);

	useEffect(() => {
		triggerFieldIfDirtyOrNotEmpty(`${name}.0`);
	}, [formError?.[1]?.message]);
};