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
import { groupJobsAndUsers } from '../assignees.helpers';
import { SearchContext } from '@controls/search/searchContext';

const NoResultsMessage = () => (
	<NoResults>
		<FormattedMessage
			id="form.searchSelect.menuContent.emptyList"
			defaultMessage="No results"
		/>
	</NoResults>
);

const preventPropagation = (e) => {
	if (e.key !== 'Escape') {
		e.stopPropagation();
	}
};
type AssigneesSelectMenuProps = SelectProps & {
	isInvalid: (val: string) => boolean;
};
export const AssigneesSelectMenu = ({
	open,
	value,
	onClick,
	multiple,
	isInvalid,
	...props
}: AssigneesSelectMenuProps) => {
	const { filteredItems } = useContext(SearchContext);
	const { users, jobs, notFound } = groupJobsAndUsers(filteredItems);
	const onClickList = useCallback((e) => {
		preventPropagation(e);
		onClick?.(e);
	}, []);

	return (
		// @ts-ignore
		<HiddenSelect
			open={open}
			value={value}
			onClick={onClickList}
			multiple={multiple}
			{...props}
		>
			<SearchInputContainer>
				<SearchInput onClick={preventPropagation} onKeyDown={preventPropagation} />
			</SearchInputContainer>
			{/* The following "invalid" components cannot be grouped together inside a fragment
				Because MuiSelect passes props to the MenuItem components and it can
				only do so if they are direct children */}
			{notFound.length > 0 && (
				<ListSubheader>
					<FormattedMessage id="assigneesSelectMenu.notFoundHeading" defaultMessage="Users and Jobs not found" />
				</ListSubheader>
			)}
			{notFound.map(({ notFoundName: ju }) => (
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
			{notFound.length > 0 && (<HorizontalRule />)}

			<ListSubheader>
				<FormattedMessage id="assigneesSelectMenu.jobsHeading" defaultMessage="Jobs" />
			</ListSubheader>
			{jobs.length > 0 && jobs.map(({ _id }) => (
				<AssigneesSelectMenuItem
					key={_id}
					assignee={_id}
					value={_id}
					title={_id}
					multiple={multiple}
					error={isInvalid(_id)}
				/>
			))}
			{!jobs.length && (<NoResultsMessage />)}

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
					error={isInvalid(user.user)}
				/>
			))}
			{!users.length && (<NoResultsMessage />)}
		</HiddenSelect>
	);
};
