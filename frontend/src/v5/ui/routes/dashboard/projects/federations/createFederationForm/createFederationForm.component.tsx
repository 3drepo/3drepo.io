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

import { useState } from 'react';
import { formatMessage } from '@/v5/services/intl';
import { NewFederationSettingsSchema } from '@/v5/validation/containerAndFederationSchemes/federationSchemes';
import { FormModal } from '@controls/formModal/formModal.component';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { NewFederation } from '@/v5/store/federations/federations.types';
import { prepareNewFederation } from '@/v5/store/federations/federations.helpers';
import { FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { nameAlreadyExists } from '@/v5/validation/errors.helpers';
import { UnhandledErrorInterceptor } from '@controls/errorMessage/unhandledErrorInterceptor/unhandledErrorInterceptor.component';
import { ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { EditFederation } from '../editFederationModal/editFederation';
import { CreateFederationFormSettings } from './createFederationSettings';

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

	const [modalPhase, setModalPhase] = useState('settings');
	const [includedContainers, setIncludedContainers] = useState([]);

	const onSubmitError = (err) => {
		setIsSubmitting(false);
		if (nameAlreadyExists(err)) {
			setAlreadyExistingNames([getValues('name').toLocaleLowerCase(), ...alreadyExistingNames]);
			setModalPhase('settings');
			trigger('name');
		}
	};

	const onClickBack = (): void => {
		setModalPhase('settings');
	};

	const onClickContinue = (): void => setModalPhase('edit');

	const onClickSubmit = (newFederation: NewFederation): void => {
		setIsSubmitting(true);
		FederationsActionsDispatchers.createFederation(
			teamspace,
			project,
			newFederation,
			includedContainers.map((container) => container._id),
			onClickClose,
			onSubmitError,
		);
	};

	const SettingsModalProps = {
		title: formatMessage({ id: 'createFederation.modal.settings.title', defaultMessage: 'New Federation' }),
		confirmLabel: formatMessage({ id: 'createFederation.modal.settings.submit', defaultMessage: 'Continue' }),
		onSubmit: handleSubmit(onClickContinue),
	};
	const EditModalProps = {
		title: formatMessage({ id: 'createFederation.modal.edit.title', defaultMessage: 'Edit Federation' }),
		confirmLabel: formatMessage({ id: 'createFederation.modal.edit.submit', defaultMessage: 'Create Federation' }),
		onClickCancel: onClickBack,
		onSubmit: handleSubmit(onClickSubmit),
		cancelLabel: formatMessage({ id: 'createFederation.modal.settings.cancel', defaultMessage: 'Back' }),
		maxWidth: 'lg',
	};

	return (
		<FormModal
			open={open}
			isValid={isValid}
			onClickClose={onClickClose}
			isSubmitting={isSubmitting}
			{...(modalPhase === 'settings' ? SettingsModalProps : EditModalProps)}
		>
			{modalPhase === 'settings' ? (
				<FormProvider {...methods}>
					<CreateFederationFormSettings />
				</FormProvider>
			) : (
				<EditFederation
					federation={prepareNewFederation(getValues())}
					onContainersChange={setIncludedContainers}
				/>
			)}
			<UnhandledErrorInterceptor expectedErrorValidators={[nameAlreadyExists]} />
		</FormModal>
	);
};
