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

import { selectJobs } from '@/v4/modules/jobs';
import { UsersHooksSelectors } from '@/v5/services/selectorsHooks/usersSelectors.hooks';
import { Assignees } from '@controls/assignees/assignees.component';
import { MultiSelectMenuItem } from '@controls/formMultiSelect/multiSelectMenuItem/multiSelectMenuItem.component';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { HiddenSearchSelect } from './assigneeSelect.styles';

type AssigneesSelectProps = {
	values: string[];
	onBlur: (values) => void;
};

export const AssigneesSelect = ({ values: initialValues, onBlur, ...props }: AssigneesSelectProps) => {
	const [values, setValues] = useState(initialValues);
	const [open, setOpen] = useState(false);

	const users = UsersHooksSelectors.selectCurrentTeamspaceUsers();
	const jobs = useSelector(selectJobs);
	const allUsersAndJobs = users.map(({ user, firstName, lastName }) => ({ value: user, label: `${firstName} ${lastName}` }));
	Array.prototype.push.apply(allUsersAndJobs, jobs.map(({ _id }) => ({ value: _id, label: _id })));

	const preventPropagation = (e) => {
		if (e.key !== 'Escape') e.stopPropagation();
	};
	const onClick = (e) => {
		preventPropagation(e);
		setOpen(true);
	};
	const handleClose = (e) => {
		preventPropagation(e);
		setOpen(false);
		onBlur(values);
	};
	const onChange = (e) => setValues(e?.target?.value);
	return (
		<>
			<Assignees assignees={values} max={7} onClick={onClick} {...props} />
			<HiddenSearchSelect
				value={values}
				multiple
				open={open}
				onClose={handleClose}
				onChange={onChange}
			>
				{(allUsersAndJobs).map(({ value, label }) => (
					<MultiSelectMenuItem key={value} value={value} onClick={preventPropagation}>
						{label}
					</MultiSelectMenuItem>
				))}
			</HiddenSearchSelect>
		</>
	);
};
