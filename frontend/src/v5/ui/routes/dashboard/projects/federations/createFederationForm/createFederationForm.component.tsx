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

import { useState, type JSX } from 'react';
import { formatMessage } from '@/v5/services/intl';
import { NewFederationSettingsSchema } from '@/v5/validation/containerAndFederationSchemes/federationSchemes';
import { FormModal } from '@controls/formModal/formModal.component';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { GroupedContainer, NewFederation } from '@/v5/store/federations/federations.types';
import { prepareNewFederation } from '@/v5/store/federations/federations.helpers';
import { FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { nameAlreadyExists } from '@/v5/validation/errors.helpers';
import { UnhandledErrorInterceptor } from '@controls/errorMessage/unhandledErrorInterceptor/unhandledErrorInterceptor.component';
import { ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { EditFederation } from '../editFederationModal/editFederation/editFederation.component';
import { CreateFederationFormSettings } from './createFederationSettings';
import { EditFederationContext, EditFederationContextComponent, EditFederationContextType } from '../editFederationModal/editFederationContext';

interface ICreateFederation {
	open: boolean;
	onClickClose: () => void;
}

const defaultValues = {
	name: '',
	desc: '',
	unit: 'mm',
	code: '',
};

export const CreateFederationForm = ({ open, onClickClose }: ICreateFederation): JSX.Element => {
	const [alreadyExistingNames, setAlreadyExistingNames] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSettingsPhase, setIsSettingsPhase] = useState(true);

	const methods = useForm<NewFederation>({
		defaultValues,
		mode: 'onChange',
		resolver: yupResolver(NewFederationSettingsSchema),
		context: { alreadyExistingNames },
	});
	const {
		handleSubmit,
		getValues,
		trigger,
		formState: { isValid },
	} = methods;

	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();

	const onSubmitError = (err) => {
		setIsSubmitting(false);
		if (nameAlreadyExists(err)) {
			setAlreadyExistingNames([getValues('name'), ...alreadyExistingNames]);
			setIsSettingsPhase(true);
			trigger('name');
		}
	};

	const onClickBack = (): void => {
		setIsSettingsPhase(true);
	};

	const onClickContinue = (): void => setIsSettingsPhase(false);

	const onClickSubmit = (newFederation: NewFederation, groupedContainers: GroupedContainer[]): void => {
		setIsSubmitting(true);
		FederationsActionsDispatchers.createFederation(
			teamspace,
			project,
			newFederation,
			groupedContainers,
			onClickClose,
			onSubmitError,
		);
	};

	const SettingsModalProps = {
		title: formatMessage({ id: 'createFederation.modal.settings.title', defaultMessage: 'New Federation' }),
		confirmLabel: formatMessage({ id: 'createFederation.modal.settings.submit', defaultMessage: 'Continue' }),
	};

	const EditModalProps = {
		title: formatMessage({ id: 'createFederation.modal.edit.title', defaultMessage: 'Edit Federation' }),
		confirmLabel: formatMessage({ id: 'createFederation.modal.edit.submit', defaultMessage: 'Create Federation' }),
		onClickCancel: onClickBack,
		cancelLabel: formatMessage({ id: 'createFederation.modal.settings.cancel', defaultMessage: 'Back' }),
		maxWidth: 'lg',
	};

	return (
		<EditFederationContextComponent federation={null}>
			<EditFederationContext.Consumer>
				{({ getGroupedContainers }: EditFederationContextType) => (
					<FormModal
						open={open}
						isValid={isValid}
						onClickClose={onClickClose}
						isSubmitting={isSubmitting}
						onSubmit={handleSubmit(isSettingsPhase ? onClickContinue : (body) => onClickSubmit(body, getGroupedContainers()))}
						{...(isSettingsPhase ? SettingsModalProps : EditModalProps)}
					>
						{isSettingsPhase ? (
							<FormProvider {...methods}>
								<CreateFederationFormSettings />
							</FormProvider>
						) : (
							<EditFederation federation={prepareNewFederation(getValues())} />
						)}
						<UnhandledErrorInterceptor expectedErrorValidators={[nameAlreadyExists]} />
					</FormModal>
				)}
			</EditFederationContext.Consumer>
		</EditFederationContextComponent>
	);
};
