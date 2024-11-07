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

import { NoResults, SearchInputContainer } from '@controls/searchSelect/searchSelect.styles';
import { ListSubheader } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { SelectProps } from '@controls/inputs/select/select.component';
import { useCallback, useContext } from 'react';
import { AssigneesSelectMenuItem } from './assigneesSelectMenuItem/assigneesSelectMenuItem.component';
import { HiddenSelect, HorizontalRule, SearchInput } from './assigneesSelectMenu.styles';
import { SearchContext } from '@controls/search/searchContext';
import { groupBy } from 'lodash';
import { IUser } from '@/v5/store/users/users.redux';
import { IJob } from '@/v5/store/jobs/jobs.types';

const preventPropagation = (e) => {
	if (e.key !== 'Escape') {
		e.stopPropagation();
	}
};
type AssigneesSelectMenuProps = SelectProps & {
	jobsAndUsersNotFound: string[];
	jobsAndUsersNotValidForModel: (IUser | IJob)[];
};
export const AssigneesSelectMenu = ({
	open,
	value,
	onClick,
	onChange,
	multiple,
	jobsAndUsersNotFound,
	jobsAndUsersNotValidForModel,
	...props
}: AssigneesSelectMenuProps) => {
	const { filteredItems } = useContext(SearchContext);
	const { jobs = [], users = [] } = groupBy(filteredItems, (item) => item?.user ? 'users' : 'jobs');

	const onClickList = useCallback((e) => {
		preventPropagation(e);
		onClick?.(e);
	}, []);

	const handleChange = (e) => {
		if (!multiple) {
			onChange(e);
			return;
		}

		// clean up invalid values
		const values = e.target.value;
		const invalidValues = [...jobsAndUsersNotFound, ...jobsAndUsersNotValidForModel.map((ju: any) => ju._id || ju.user)];
		const validValues = values.filter((v) => !invalidValues.includes(v));
		onChange({ ...e, target: { ...e.target, value: validValues } });
	};

	return (
		// @ts-ignore
		<HiddenSelect
			open={open}
			value={value}
			onClick={onClickList}
			multiple={multiple}
			{...props}
			onChange={handleChange}
		>
			<SearchInputContainer>
				<SearchInput onClick={preventPropagation} onKeyDown={preventPropagation} />
			</SearchInputContainer>
			{/* The following "invalid" components cannot be grouped together inside a fragment
				Because MuiSelect passes has to pass props to the MenuItem components and it can
				only do so if they are direct children */}
			{jobsAndUsersNotFound.length > 0 && (
				<ListSubheader>
					<FormattedMessage id="assigneesSelectMenu.notFoundHeading" defaultMessage="Users and Jobs not found" />
				</ListSubheader>
			)}
			{jobsAndUsersNotFound.map((ju) => (
				<AssigneesSelectMenuItem
					key={ju}
					assignee={ju}
					value={ju}
					title={ju}
					multiple={multiple}
					selected
					error
				/>
			))}
			{jobsAndUsersNotFound.length > 0 && (<HorizontalRule />)}
			<ListSubheader>
				<FormattedMessage id="assigneesSelectMenu.jobsHeading" defaultMessage="Jobs" />
			</ListSubheader>
			{jobs.length > 0 && jobs.map((job) => (
				<AssigneesSelectMenuItem
					key={job._id}
					assignee={job._id}
					value={job._id}
					title={job._id}
					multiple={multiple}
					error={jobsAndUsersNotValidForModel.includes(job)}
				/>
			))}
			{!jobs.length && (
				<NoResults>
					<FormattedMessage
						id="form.searchSelect.menuContent.emptyList"
						defaultMessage="No results"
					/>
				</NoResults>
			)}

			<HorizontalRule />

			<ListSubheader>
				<FormattedMessage id="assigneesSelectMenu.usersHeading" defaultMessage="Users" />
			</ListSubheader>
			{users.length > 0 && users.map((user) => (
				<AssigneesSelectMenuItem
					key={user.user}
					value={user.user}
					assignee={user.user}
					title={`${user.firstName} ${user.lastName}`}
					subtitle={user.job}
					multiple={multiple}
					error={jobsAndUsersNotValidForModel.includes(user)}
				/>
			))}
			{!users.length && (
				<NoResults>
					<FormattedMessage
						id="form.searchSelect.menuContent.emptyList"
						defaultMessage="No results"
					/>
				</NoResults>
			)}
		</HiddenSelect>
	);
};
