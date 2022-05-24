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

import { SyntheticEvent, useState } from 'react';
import { IContainer } from '@/v5/store/containers/containers.types';
import { formatMessage } from '@/v5/services/intl';
import { IFederation } from '@/v5/store/federations/federations.types';

import { FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers/federationsActions.dispatchers';
import { useParams } from 'react-router-dom';
import { FormModal, IFormModal } from '@controls/modal/formModal/formDialog.component';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { EditFederation } from './editFederation';
import { useContainersData } from '../../containers/containers.hooks';

type EditFederationModalProps = IFormModal & {
	openState?: boolean;
	federation: IFederation;
	isNewFederation?: boolean;
	onClickClose?: () => void;
	onContainersChange?: (containers) => void;
};

export const EditFederationModal = ({
	openState,
	federation,
	isNewFederation,
	onClickClose,
	onContainersChange,
	...otherProps
}: EditFederationModalProps): JSX.Element => {
	useContainersData();
	const { teamspace, project } = useParams<DashboardParams>();
	const [includedContainers, setIncludedContainers] = useState<IContainer[]>([]);

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
			title={
				formatMessage({
					id: 'modal.editFederation.title',
					defaultMessage: 'Edit {federationName}',
				}, { federationName: federation.name })
			}
			confirmLabel={formatMessage({ id: 'modal.editFederation.confirm', defaultMessage: 'Save Changes' })}
			onClickClose={onClickClose}
			onSubmit={saveChanges}
			isValid={includedContainers.length > 0}
			maxWidth="lg"
			zeroMargin
			{...otherProps}
		>
			<EditFederation
				federation={federation}
				onContainersChange={(containers: IContainer[]) => setIncludedContainers(
					containers,
				)}
			/>
		</FormModal>
	);
};
