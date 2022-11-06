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

import { UsersHooksSelectors } from '@/v5/services/selectorsHooks/usersSelectors.hooks';
import { MultiSelectMenuItem } from '@controls/formMultiSelect/multiSelectMenuItem/multiSelectMenuItem.component';
import { useSelector } from 'react-redux';
import { selectJobs } from '@/v4/modules/jobs';
import { FormMultiSelect } from '@controls/formMultiSelect/formMultiSelect.component';
import { PropertyProps } from './properties.types';

export const ManyOfProperty = ({ property, ...props }: PropertyProps) => {
	const { name, readOnly, required, values } = property;
	let items = [];

	useSelector(selectJobs);

	if (values === 'jobsAndUsers') {
		const users = UsersHooksSelectors.selectCurrentTeamspaceUsers();
		const jobs = useSelector(selectJobs);
		items = users.map(({ user, firstName, lastName }) => ({ value: user, label: `${firstName} ${lastName}` }));
		Array.prototype.push.apply(items, jobs.map(({ _id }) => ({ value: _id, label: _id })));
	} else {
		items = (values as string[]).map((value) => ({ value, label: value }));
	}

	return (
		<FormMultiSelect
			label={name}
			disabled={readOnly}
			required={required}
			{...props}
		>
			{(items).map(({ value, label }) => (
				<MultiSelectMenuItem key={value} value={value}>{label}</MultiSelectMenuItem>
			))}
		</FormMultiSelect>
	);
};
