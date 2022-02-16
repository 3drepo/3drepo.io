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

import React, { SyntheticEvent, useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { IContainer } from '@/v5/store/containers/containers.types';
import { Button } from '@controls/button';
import { formatMessage } from '@/v5/services/intl';
import { IFederation } from '@/v5/store/federations/federations.types';
import { DashboardListEmptyText, Divider } from '@components/dashboard/dashboardList/dashboardList.styles';
import { Tooltip } from '@material-ui/core';
import { FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers/federationsActions.dispatchers';
import { useParams } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { FormModal, IconContainer, IncludeIcon, RemoveIcon } from './editFederationModal.styles';
import { ActionButtonProps, EditFederationContainers, IconButtonProps } from './editFederationContainersList/editFederationContainersList.component';
import { useContainersData } from '../../containers/containers.hooks';

type EditFederationModalProps = {
	openState: boolean;
	federation: IFederation;
	onClickClose: () => void;
};

export const EditFederationModal = ({
	openState,
	federation,
	onClickClose,
}: EditFederationModalProps): JSX.Element => {
	const { teamspace, project } = useParams() as { teamspace: string, project: string };
	const { containers } = useContainersData();
	const getContainerById = (id: string) => containers.find((container: IContainer) => container._id === id);

	const [includedContainers, setIncludedContainers] = useState<IContainer[]>([]);
	const [availableContainers, setAvailableContainers] = useState<IContainer[]>([]);

	useEffect(() => {
		setIncludedContainers(federation.containers.map(getContainerById));
		setAvailableContainers(
			containers.filter((container) => !federation.containers.includes(container._id)),
		);
	}, [containers]);

	const includeContainer = (container: IContainer) => {
		setIncludedContainers([...includedContainers, container]);
		setAvailableContainers(availableContainers.filter(({ _id }) => _id !== container._id));
	};

	const includeAllContainers = () => {
		setIncludedContainers(containers);
		setAvailableContainers([]);
	};

	const removeContainer = (container: IContainer) => {
		setAvailableContainers([...availableContainers, container]);
		setIncludedContainers(includedContainers.filter(({ _id }) => _id !== container._id));
	};

	const removeAllContainers = () => {
		setIncludedContainers([]);
		setAvailableContainers(containers);
	};

	const saveChanges = (event: SyntheticEvent) => {
		FederationsActionsDispatchers.updateFederationContainers(
			teamspace,
			project,
			federation._id,
			includedContainers.map((container) => container._id),
		);
		event.preventDefault();
		onClickClose();
	};

	return (
		<FormModal
			open={openState}
			title={formatMessage({
				id: 'modal.editFederation.title',
				defaultMessage: 'Edit {federationName}',
			}, { federationName: federation.name })}
			confirmLabel={formatMessage({ id: 'modal.editFederation.confirm', defaultMessage: 'Save Changes' })}
			onClickClose={onClickClose}
			onSubmit={saveChanges}
			isValid={includedContainers.length > 0}
		>
			<EditFederationContainers
				containers={includedContainers}
				hasContainers={!isEmpty(includedContainers)}
				title={
					formatMessage({
						id: 'modal.editFederation.containers.title',
						defaultMessage: 'Containers included in {federationName}',
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
				actionButton={({ children, disabled }: ActionButtonProps) => (
					<Button
						errorButton
						onClick={removeAllContainers}
						disabled={disabled}
					>
						{children}
					</Button>
				)}
				actionButtonTexts={{
					allResults: <FormattedMessage id="modal.editFederation.included.removeAll" defaultMessage="Remove all" />,
					filteredResults: <FormattedMessage id="modal.editFederation.included.removeShown" defaultMessage="Remove shown" />,
				}}
				iconButton={({ container }: IconButtonProps) => (
					<Tooltip title={formatMessage({
						id: 'modal.editFederation.available.remove.tooltip',
						defaultMessage: 'Remove container',
					})}
					>
						<IconContainer
							onClick={(event) => {
								event.stopPropagation();
								removeContainer(container);
							}}
						>
							<RemoveIcon />
						</IconContainer>
					</Tooltip>
				)}
			/>
			<Divider />
			<EditFederationContainers
				containers={availableContainers}
				hasContainers={!isEmpty(availableContainers)}
				title={
					formatMessage({
						id: 'modal.editFederation.containers.title',
						defaultMessage: 'Available containers',
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
				actionButton={({ children, disabled }) => (
					<Button
						variant="outlined"
						color="primary"
						onClick={includeAllContainers}
						disabled={disabled}
					>
						{children}
					</Button>
				)}
				actionButtonTexts={{
					allResults: <FormattedMessage id="modal.editFederation.available.includeAll" defaultMessage="Include all" />,
					filteredResults: <FormattedMessage id="modal.editFederation.available.includeShown" defaultMessage="Include shown" />,
				}}
				iconButton={({ container, isSelected }: IconButtonProps) => (
					<Tooltip title={formatMessage({
						id: 'modal.editFederation.available.include.tooltip',
						defaultMessage: 'Include container',
					})}
					>
						<IconContainer
							onClick={(event) => {
								event.stopPropagation();
								includeContainer(container);
							}}
						>
							<IncludeIcon isSelected={isSelected} />
						</IconContainer>
					</Tooltip>
				)}
			/>
		</FormModal>
	);
};
