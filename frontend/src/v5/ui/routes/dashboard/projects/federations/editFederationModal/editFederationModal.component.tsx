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

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { IContainer } from '@/v5/store/containers/containers.types';
import { SearchInput } from '@controls/searchInput';
import { Button } from '@controls/button';
import { ContainersHooksSelectors } from '@/v5/services/selectorsHooks/containersSelectors.hooks';
import { DEFAULT_SORT_CONFIG, useOrderedList } from '@components/dashboard/dashboardList/useOrderedList';
import { formatMessage } from '@/v5/services/intl';
import { IFederation } from '@/v5/store/federations/federations.types';
import { Divider } from '@components/dashboard/dashboardList/dashboardList.styles';

import { FormModal } from './editFederationModal.styles';
import { EditFederationContainers } from './editFederationContainersList/editFederationContainersList.component';
import { ThemeProvider } from '@material-ui/core';
import { removeAllButtonTheme } from './editFederationModal.styles';

type IEditFederationModal = {
	openState: boolean;
	federation: IFederation;
	filterQuery?: string;
	onFilterQueryChange?: (query: string) => void;
	onClickClose: () => void;
};

export const EditFederationModal = ({
	openState,
	federation,
	filterQuery,
	onFilterQueryChange,
	onClickClose,
}: IEditFederationModal): JSX.Element => {
	const containers = ContainersHooksSelectors.selectContainers();
	const getContainerById = (id: string) => containers.find((container: IContainer) => container._id === id);
	// const { teamspace, project } = useParams() as { teamspace: string, project: string };
	// const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

	// const isListPending = ContainersHooksSelectors.selectIsListPending();
	// const areStatsPending = ContainersHooksSelectors.selectAreStatsPending();
	// const { sortedList, setSortConfig } = useOrderedList(containers, DEFAULT_SORT_CONFIG);
	const [includedContainers, setIncludedContainers] = useState(federation.subModels.map(getContainerById));
	const [availableContainers, setAvailableContainer] = useState(
		includedContainers.filter((container) => !includedContainers.includes(container))
	);

	const includeContainer = (containerToAdd: IContainer) => {
		setIncludedContainers([...includedContainers, containerToAdd]);
		setAvailableContainer(availableContainers.filter((container) => container._id !== containerToAdd._id));
	};

	const removeContainer = (containerToRemove: IContainer) => {
		setIncludedContainers([...includedContainers, containerToRemove]);
		setIncludedContainers(includedContainers.filter((container) => container._id !== containerToRemove._id));
	};

	useEffect(() => {
		// containers = ContainersHooksSelectors.selectContainers();
	}, [openState]);
	// useEffect(() => {
	// 	setAvaicontainers.);
	// }, [includedContainers, containers]);

	return (
		<FormModal
			open={openState}
			title={formatMessage({
				id: 'modal.editFederation.title',
				defaultMessage: 'Edit {federationName}',
			}, { federationName: federation.name })}
			confirmLabel={formatMessage({ id: 'modal.editFederation.confirm', defaultMessage: 'Save Changes' })}
			onClickClose={onClickClose}
		>
			<EditFederationContainers
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
					<FormattedMessage
						id="modal.editFederation.included.emptyMessage"
						defaultMessage="You haven’t added any Containers to this Federation. Add Federations from the list of Containers below."
					/>
				)}
				containers={includedContainers}
				actionButton={(
					<ThemeProvider theme={removeAllButtonTheme}>
						<Button
							variant="outlined"
							color="error"
						>
							<FormattedMessage id="modal.editFederation.included.removeAll" defaultMessage="Remove All" />
						</Button>
					</ThemeProvider>
				)}
			/>
			<Divider />
			<EditFederationContainers
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
					<FormattedMessage
						id="modal.editFederation.available.emptyMessage"
						defaultMessage="You don’t have any available Containers."
					/>
				)}
				containers={getAvailableContainers() || []}
				actionButton={(
					<Button
						variant="outlined"
						color="primary"
					>
						<FormattedMessage id="modal.editFederation.included.addAll" defaultMessage="Add All" />
					</Button>
				)}
			/>
		</FormModal>
	);
};
