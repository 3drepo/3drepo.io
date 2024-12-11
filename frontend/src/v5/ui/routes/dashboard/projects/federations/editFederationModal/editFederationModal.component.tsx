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

import { SyntheticEvent } from 'react';
import { formatMessage } from '@/v5/services/intl';

import { FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { IFormModal } from '@controls/formModal/formModal.component';
import { ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { isEqual } from 'lodash';
import { IFederation } from '@/v5/store/federations/federations.types';
import { EditFederation } from './editFederation/editFederation.component';
import { FormModal } from './editFederationModal.styles';
import { EditFederationContext, EditFederationContextComponent, EditFederationContextType } from './editFederationContext';

type EditFederationModalProps = IFormModal & {
	open: boolean;
	federation: IFederation;
	onClickClose?: () => void;
};
export const EditFederationModal = ({
	open,
	federation,
	onClickClose,
	...otherProps
}: EditFederationModalProps): JSX.Element => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();

	const saveChanges = (event: SyntheticEvent, groupedContainers) => {
		FederationsActionsDispatchers.updateFederationContainers(
			teamspace,
			project,
			federation._id,
			groupedContainers,
		);
		event.preventDefault();
		onClickClose();
	};

	return (
		<EditFederationContextComponent federation={federation}>
			<EditFederationContext.Consumer>
				{({ getGroupedContainers, includedContainersIds, isReadOnly }: EditFederationContextType) => (
					<FormModal
						open={open}
						title={ isReadOnly ? 
							formatMessage({
								id: 'modal.editFederation.title.readOnly',
								defaultMessage: 'Viewing {federationName}',
							}, { federationName: federation.name }) : formatMessage({
								id: 'modal.editFederation.title',
								defaultMessage: 'Edit {federationName}',
							}, { federationName: federation.name })
						}
						confirmLabel={formatMessage({ id: 'modal.editFederation.confirm', defaultMessage: 'Save Changes' })}
						onClickClose={onClickClose}
						onSubmit={(e) => saveChanges(e, getGroupedContainers())}
						isValid={includedContainersIds.length && !isEqual(getGroupedContainers(), federation.containers)}
						maxWidth="lg"
						isReadOnly={isReadOnly}
						{...otherProps}
					>
						<EditFederation federation={federation} />
					</FormModal>
				)}
			</EditFederationContext.Consumer>
		</EditFederationContextComponent>
	);
};
