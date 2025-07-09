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

import { formatMessage } from '@/v5/services/intl';
import { FederationsHooksSelectors } from '@/v5/services/selectorsHooks';
import { CONTAINERS_SEARCH_FIELDS } from '@/v5/store/containers/containers.helpers';
import { IFederation } from '@/v5/store/federations/federations.types';
import { DashboardListEmptyText, Divider } from '@components/dashboard/dashboardList/dashboardList.styles';
import { SearchContextComponent } from '@controls/search/searchContext';
import { Tooltip } from '@mui/material';
import RemoveIcon from '@assets/icons/outlined/minus_minimal-outline.svg';
import IncludeIcon from '@assets/icons/outlined/plus_minimal-outline.svg';
import { useCallback, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { useContainersData } from '../../../containers/containers.hooks';
import { SuccessIconContainer, ErrorIconContainer, SuccessButton, ErrorButton } from './editFederation.styles';
import { ActionButtonProps, EditFederationContainers } from './editFederationContainersList/editFederationContainersList.component';
import { IconButtonProps } from './editFederationContainersList/editFederationContainersListItem/editFederationContainersListItem.component';
import { EditFederationContext } from '../editFederationContext';
import { groupBy } from 'lodash';

type EditFederationProps = {
	federation: IFederation;
};

export const EditFederation = ({ federation }: EditFederationProps): JSX.Element => {
	const { containers } = useContainersData();
	const { includedContainersIds, setIncludedContainersIds } = useContext(EditFederationContext);
	const isNewFederation = !federation._id;
	const isCollaboratorFromId = FederationsHooksSelectors.selectHasCollaboratorAccess(federation._id);
	const isCollaborator = isNewFederation || isCollaboratorFromId;
	const { available = [], included = [] } = groupBy(
		containers,
		(c) => includedContainersIds.includes(c._id) ? 'included' : 'available',
	);

	const includeContainers = (ids: string[]) => setIncludedContainersIds((oldIds) => [...oldIds, ...ids]);
	const removeContainers = (ids: string[]) => setIncludedContainersIds((oldIds) => oldIds.filter((id) => !ids.includes(id)));

	return (
		<>
			<SearchContextComponent items={included} fieldsToFilter={CONTAINERS_SEARCH_FIELDS}>
				<EditFederationContainers
					isIncluded
					title={
						formatMessage({
							id: 'modal.editFederation.containers.title',
							defaultMessage: 'Containers included',
						}, { federationName: federation.name })
					}
					collapsableTooltips={{
						collapsed: <FormattedMessage id="modal.editFederation.available.collapse.tooltip.show" defaultMessage="Show available containers" />,
						visible: <FormattedMessage id="modal.editFederation.available.collapse.tooltip.hide" defaultMessage="Hide available containers" />,
					}}
					emptyListMessage={(
						<DashboardListEmptyText>
							<FormattedMessage
								id="modal.editFederation.included.emptyMessage"
								defaultMessage="You haven’t added any Containers to this Federation. Add Federations from the list of Containers below."
							/>
						</DashboardListEmptyText>
					)}
					actionButton={({ children, disabled, filteredContainersIds }: ActionButtonProps) => isCollaborator && (
						<ErrorButton
							onClick={() => removeContainers(filteredContainersIds)}
							disabled={disabled}
						>
							{children}
						</ErrorButton>
					)}
					actionButtonTexts={{
						allResults: <FormattedMessage id="modal.editFederation.included.removeAll" defaultMessage="Remove all" />,
						filteredResults: <FormattedMessage id="modal.editFederation.included.removeShown" defaultMessage="Remove shown" />,
					}}
					iconButton={useCallback(({ container, isSelected }: IconButtonProps) => (
						<Tooltip title={formatMessage({
							id: 'modal.editFederation.available.remove.tooltip',
							defaultMessage: 'Remove container',
						})}
						>
							<ErrorIconContainer
								onClick={(event) => {
									event.stopPropagation();
									removeContainers([container._id]);
								}}
								$dark={isSelected}
								hidden={!isCollaborator}
							>
								<RemoveIcon />
							</ErrorIconContainer>
						</Tooltip>
					), [])}
				/>
			</SearchContextComponent>
			<Divider />
			{/* <SearchContextComponent items={available} fieldsToFilter={CONTAINERS_SEARCH_FIELDS}>
				<EditFederationContainers
					title={
						formatMessage({
							id: 'modal.editFederation.containers.title',
							defaultMessage: 'Containers not included',
						})
					}
					collapsableTooltips={{
						collapsed: <FormattedMessage id="modal.editFederation.included.collapse.tooltip.show" defaultMessage="Show included federations" />,
						visible: <FormattedMessage id="modal.editFederation.included.collapse.tooltip.hide" defaultMessage="Hide included federations" />,
					}}
					emptyListMessage={(
						<DashboardListEmptyText>
							<FormattedMessage
								id="modal.editFederation.available.emptyMessage"
								defaultMessage="You don’t have any available Containers."
							/>
						</DashboardListEmptyText>
					)}
					actionButton={({ children, disabled, filteredContainersIds: filteredContainers, ...buttonProps }) => isCollaborator && (
						<SuccessButton
							onClick={() => includeContainers(filteredContainers)}
							disabled={disabled}
							{...buttonProps}
						>
							{children}
						</SuccessButton>
					)}
					actionButtonTexts={{
						allResults: <FormattedMessage id="modal.editFederation.available.addAll" defaultMessage="Add all" />,
						filteredResults: <FormattedMessage id="modal.editFederation.available.addShown" defaultMessage="Add shown" />,
					}}
					iconButton={useCallback(({ container, isSelected }: IconButtonProps) => (
						<Tooltip title={formatMessage({
							id: 'modal.editFederation.available.add.tooltip',
							defaultMessage: 'Add container',
						})}
						>
							<SuccessIconContainer
								onClick={(event) => {
									event.stopPropagation();
									includeContainers([container._id]);
								}}
								$dark={isSelected}
								hidden={!isCollaborator}
							>
								<IncludeIcon />
							</SuccessIconContainer>
						</Tooltip>
					), [])}
				/>
			</SearchContextComponent> */}
		</>
	);
};
