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

import { useContext } from 'react';
import { TicketContext } from '../../routes/viewer/tickets/ticket.context';
import { getInvalidValues, getModelJobsAndUsers, getValidValues } from './assignees.helpers';
import { UsersAndJobsSelect, UsersAndJobsSelectProps } from '@controls/usersAndJobsSelect/usersAndJobsSelect.component';

export type AssigneesSelectProps = Omit<UsersAndJobsSelectProps, 'isValidItem' | 'usersAndJobs'> & {
	excludeViewers?: boolean;
};

export const AssigneesSelect = ({
	excludeViewers = false,
	...props
}: AssigneesSelectProps) => {
	const { containerOrFederation } = useContext(TicketContext);
	const { jobs, users } = getModelJobsAndUsers(containerOrFederation);

	const valueAsArray = props.multiple ? props.value : [props.value].filter(Boolean);
	const validValues = getValidValues([...jobs, ...users], excludeViewers);
	const invalidValues = getInvalidValues(valueAsArray, validValues);

	const usersAndJobs = [...validValues, ...invalidValues];

	const isValidItem = (v) => !invalidValues.includes(v);
	return (<UsersAndJobsSelect isValidItem={isValidItem} usersAndJobs={usersAndJobs} {...props}/>);
};