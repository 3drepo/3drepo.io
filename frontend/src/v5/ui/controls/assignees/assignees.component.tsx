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
import { MultiSelectMenuItem } from '@controls/formMultiSelect/multiSelectMenuItem/multiSelectMenuItem.component';
import { HoverPopover } from '@controls/hoverPopover/hoverPopover.component';
import { isEqual } from 'lodash';
import { memo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { AssigneeListItem } from './assigneeListItem/assigneeListItem.component';
import { AssigneesList, ExtraAssignees, HiddenSearchSelect } from './assignees.styles';
import { ExtraAssigneesPopover } from './extraAssignees/extraAssigneesPopover.component';

type AssigneesProps = {
	values: string[];
	max?: number;
	disabled?: boolean;
	onBlur: (values) => void;
	className?: string;
};

export const Assignees = memo(({
	values: initialValues,
	onBlur,
	max = 7,
	disabled,
	...props
}: AssigneesProps) => {
	const [values, setValues] = useState(initialValues);
	const [open, setOpen] = useState(false);
	const listedAssignees = initialValues.slice(0, max - 1);
	const overflowAssignees = initialValues.slice(max - 1);
	const allUsersAndJobs = UsersHooksSelectors.selectAssigneesListItems();

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
		<AssigneesList onClick={onClick} {...props}>
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
			{listedAssignees.length ? (
				listedAssignees.map((assignee) => (
					<AssigneeListItem key={assignee} assignee={assignee} />
				))
			) : (
				<FormattedMessage id="assignees.unassigned" defaultMessage="Unassigned" />
			)}
			{overflowAssignees.length ? (
				<HoverPopover
					anchor={(extraProps) => <ExtraAssignees assignees={overflowAssignees} {...extraProps} />}
				>
					<ExtraAssigneesPopover assignees={overflowAssignees} />
				</HoverPopover>
			) : <></>}
		</AssigneesList>
	);
}, (a, b) => isEqual(a.values, b.values));
