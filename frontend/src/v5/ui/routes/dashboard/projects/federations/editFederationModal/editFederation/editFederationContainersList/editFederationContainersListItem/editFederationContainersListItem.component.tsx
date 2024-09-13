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

import { ComponentType, memo, useContext, useEffect, useState } from 'react';
import { IContainer } from '@/v5/store/containers/containers.types';
import { DashboardListItemButton, DashboardListItemText } from '@components/dashboard/dashboardList/dashboardListItem/components';
import { Highlight } from '@controls/highlight';
import { Display } from '@/v5/ui/themes/media';
import { formatDateTime } from '@/v5/helpers/intl.helper';
import { FormattedMessage } from 'react-intl';
import { DashboardListItem } from '@components/dashboard/dashboardList';
import { DashboardListItemContainerTitle } from '@components/dashboard/dashboardList/dashboardListItem/components/dashboardListItemTitle';
import { uniq } from 'lodash';
import { ContainerRevisionDetails } from '@components/shared/containerRevisionDetails/containerRevisionDetails.component';
import { AutocompleteTextfield, DashboardListItemRow, Autocomplete } from './editFederationContainersListItem.styles';
import { OptionsBox } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemDestination/uploadListItemDestination.styles';
import { EditFederationContext } from '../../../editFederationContext';
import { GroupOption } from './groupOption/groupOption.component';

export type IconButtonProps = {
	container: IContainer;
	isSelected?: boolean;
};

type EditFederationContainersListItemProps = {
	isSelected: boolean;
	container: IContainer;
	filterQuery?: string;
	icon: ComponentType<IconButtonProps>;
	onItemClick: (id: string) => void;
};
export const EditFederationContainersListItem = memo(({
	icon: Icon,
	isSelected,
	container,
	filterQuery,
	onItemClick,
}: EditFederationContainersListItemProps) => {
	const { setGroupsByContainer, groupsByContainer, groups, includedContainers, isReadOnly } = useContext(EditFederationContext);
	const [groupValue, setGroupValue] = useState(groupsByContainer[container._id] || null);

	const isIncluded = !!includedContainers.find(({ _id }) => _id === container._id);

	const updateGroupsByContainer = (newValue) => {
		setGroupsByContainer((existingGroups) => ({ ...existingGroups, [container._id]: newValue }));
	};

	const onGroupClose = (e, reason) => {
		if (reason !== 'blur') return;
		updateGroupsByContainer(groupValue);
	};

	const onGroupChange = (e, val, reason) => {
		setGroupValue(val);

		if (['selectOption', 'blur', 'clear'].includes(reason)) {
			updateGroupsByContainer(val);
		}
	};

	const filterOptions = (options, { inputValue }) => {
		const filteredOptions = options.filter((option) => option.includes(inputValue));
		return uniq([...filteredOptions, inputValue]);
	};

	useEffect(() => {
		if (!isIncluded && groupsByContainer[container._id]) {
			delete groupsByContainer[container._id];
			setGroupsByContainer(groupsByContainer);
		}
	}, [isIncluded]);

	return (
		<DashboardListItem
			selected={isSelected}
			key={container._id}
		>
			<DashboardListItemRow
				selected={isSelected}
				onClick={() => onItemClick(container._id)}
			>
				<DashboardListItemContainerTitle
					minWidth={116}
					container={container}
					isSelected={isSelected}
					openInNewTab
				/>
				<DashboardListItemButton
					width={186}
					onClick={() => onItemClick(container._id)}
					hideWhenSmallerThan={Display.Desktop}
					tooltipTitle={
						<FormattedMessage id="modal.editFederation.list.item.revisions.tooltip" defaultMessage="View revisions" />
					}
				>
					<FormattedMessage
						id="modal.editFederation.list.item.revisions"
						defaultMessage="{count, plural, =0 {No revisions} one {# revision} other {# revisions}}"
						values={{ count: container.revisionsCount }}
					/>
				</DashboardListItemButton>
				<DashboardListItemText
					width={160}
					selected={isSelected}
				>
					<Highlight search={filterQuery}>
						{container.code}
					</Highlight>
				</DashboardListItemText>
				{/* eslint-disable-next-line */}
				<div onClick={(e) => e.stopPropagation()}>
					<DashboardListItemText
						width={160}
						selected={isSelected}
					>
						{isIncluded && (
							<Autocomplete
								value={groupValue}
								onInputChange={onGroupChange}
								onClose={onGroupClose}
								renderInput={(params) => <AutocompleteTextfield {...params} />}
								options={groups}
								getOptionLabel={(group: string) => group}
								ListboxComponent={OptionsBox}
								disableClearable={!groupValue}
								selectOnFocus
								renderOption={(optionProps, value: string) => (
									<GroupOption
										{...optionProps}
										value={value}
										onClick={(e) => {
											optionProps.onClick(e);
											updateGroupsByContainer(value);
										}}
									/>
								)}
								filterOptions={filterOptions}
								disabled={isReadOnly}
							/>
						)}
					</DashboardListItemText>
				</div>
				<DashboardListItemText
					width={160}
					hideWhenSmallerThan={Display.Tablet}
					selected={isSelected}
				>
					<Highlight search={filterQuery}>
						{container.type}
					</Highlight>
				</DashboardListItemText>
				<DashboardListItemText
					width={123}
					selected={isSelected}
				>
					{container.lastUpdated && formatDateTime(container.lastUpdated)}
				</DashboardListItemText>
				<Icon container={container} isSelected={isSelected} />
			</DashboardListItemRow>
			{isSelected && (
				<ContainerRevisionDetails
					containerId={container._id}
					revisionsCount={container.revisionsCount}
					status={container.status}
				/>
			)}
		</DashboardListItem>
	);
});
