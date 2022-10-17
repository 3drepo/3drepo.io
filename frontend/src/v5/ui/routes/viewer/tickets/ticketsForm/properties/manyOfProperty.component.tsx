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

import { TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks/teamspacesSelectors.hooks';
import { UsersHooksSelectors } from '@/v5/services/selectorsHooks/usersSelectors.hooks';
import { PropertyDefinition } from '@/v5/store/tickets/tickets.types';
import { FormMultiSelect } from '@controls/formSearchSelect/formMultiSelect/formMultiSelect.component';
import { MultiSelectMenuItem } from '@controls/formSearchSelect/formMultiSelect/multiSelectMenuItem/multiSelectMenuItem.component';
import { store } from '@/v4/modules/store';
import _ from 'lodash';

export const ManyOfProperty = ({
	property: { name, readOnly, required, values },
	value: deafultValues,
}: { property: PropertyDefinition, value: any }) => {
	const selectedValues = (deafultValues || []) as string[];

	if (values === 'jobsAndUsers') {
		const teampspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
		const users = _.sortBy(UsersHooksSelectors.selectUsersByTeamspace(teampspace), 'firstName');
		// TODO fix after "jobs" is accessible in v5
		// @ts-ignore
		const { jobs } = store.getState();
		const jobItems = jobs.jobs.map(({ _id }) => (
			<MultiSelectMenuItem key={_id} value={_id}>{_id}</MultiSelectMenuItem>
		));
		const userItems = users.map(({ user, firstName, lastName }) => (
			<MultiSelectMenuItem key={user} value={user}>{`${firstName} ${lastName}`}</MultiSelectMenuItem>
		));
		return (
			<FormMultiSelect
				label={name}
				name={name}
				defaultValue={selectedValues}
				disabled={readOnly}
				required={required}
			>
				{jobItems.concat(userItems)}
			</FormMultiSelect>
		);
	}

	return (
		<FormMultiSelect
			label={name}
			name={name}
			defaultValue={selectedValues}
			disabled={readOnly}
			required={required}
		>
			{(values as any[]).map((value) => (
				<MultiSelectMenuItem key={value} value={value}>{value}</MultiSelectMenuItem>
			))}
		</FormMultiSelect>
	);
};
