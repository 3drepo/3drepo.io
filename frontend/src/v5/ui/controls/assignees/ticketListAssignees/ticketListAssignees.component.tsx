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

import { UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { MultiSelectMenuItem } from '@controls/inputs/multiSelect/multiSelectMenuItem/multiSelectMenuItem.component';
import { intersection } from 'lodash';
import { useState } from 'react';
import { AssigneesList } from '../assigneesList/assigneesList.component';
import { HiddenSearchSelect } from './ticketListAssignees.styles';

type TicketListAssigneesProps = {
	values: string[];
	disabled?: boolean;
	onBlur: (values) => void;
	className?: string;
};

export const TicketListAssignees = ({
	values: initialValues,
	onBlur,
	disabled,
	...props
}: TicketListAssigneesProps) => {
	const allUsersAndJobs = UsersHooksSelectors.selectAssigneesListItems();
	// Must filter out users not included in this teamspace. This can occur when a user
	// has been assigned to a ticket and later on is removed from the teamspace
	const [values, setValues] = useState(intersection(initialValues, allUsersAndJobs.map((i) => i.value)));
	const [open, setOpen] = useState(false);

	const preventPropagation = (e) => {
		if (e.key !== 'Escape') e.stopPropagation();
	};
	const onClick = (e) => {
		preventPropagation(e);
		setOpen(!disabled);
	};
	const handleClose = (e) => {
		preventPropagation(e);
		setOpen(false);
		onBlur(values);
	};
	const onChange = (e) => setValues(e?.target?.value);

	return (
		<>
			<HiddenSearchSelect
				value={values}
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
			<AssigneesList onClick={onClick} values={values} maxItems={7} {...props} />
		</>
	);
};
