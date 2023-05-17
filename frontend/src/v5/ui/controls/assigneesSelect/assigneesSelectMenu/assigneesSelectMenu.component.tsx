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

import { formatMessage } from '@/v5/services/intl';
import { SearchContext, SearchContextType } from '@controls/search/searchContext';
import { NoResults, SearchInputContainer } from '@controls/searchSelect/searchSelect.styles';
import { ListSubheader } from '@mui/material';
import { get, partition } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { SelectProps } from '@controls/inputs/select/select.component';
import { useCallback, useContext, useState, useEffect } from 'react';
import { IUser } from '@/v5/store/users/users.redux';
import { IJob } from '@/v5/store/jobs/jobs.types';
import { AssigneesSelectMenuItem } from './assigneesSelectMenuItem/assigneesSelectMenuItem.component';
import { HiddenSelect, HorizontalRule, SearchInput } from './assigneesSelectMenu.styles';

const isUser = (assignee) => get(assignee, 'user');

const preventPropagation = (e) => {
	if (e.key !== 'Escape') {
		e.stopPropagation();
	}
};

export const AssigneesSelectMenu = ({
	open,
	value,
	onClick,
	...props
}: SelectProps) => {
	const [users, setUsers] = useState([]);
	const [jobs, setJobs] = useState([]);
	const { filteredItems } = useContext<SearchContextType<IJob | IUser>>(SearchContext);
	const onClickList = useCallback((e) => {
		preventPropagation(e);
		onClick?.(e);
	}, []);
	useEffect(() => {
		const [filteredUsers, filteredJobs] = partition(filteredItems, isUser);
		setUsers(filteredUsers);
		setJobs(filteredJobs);
	}, [filteredItems.length]);

	return (
		// @ts-ignore
		<HiddenSelect
			open={open}
			value={value || []}
			onClick={onClickList}
			{...props}
		>
			<SearchInputContainer>
				<SearchInput
					placeholder={formatMessage({ id: 'searchSelect.searchInput.placeholder', defaultMessage: 'Search...' })}
					onClick={preventPropagation}
					onKeyDown={preventPropagation}
				/>
			</SearchInputContainer>
			<ListSubheader>
				<FormattedMessage id="assigneesSelectMenu.jobsHeading" defaultMessage="Jobs" />
			</ListSubheader>
			{jobs.length > 0 && jobs.map(({ _id }) => (
				<AssigneesSelectMenuItem
					key={_id}
					assignee={_id}
					value={_id}
					title={_id}
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
