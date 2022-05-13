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

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { formatMessage } from '@/v5/services/intl';
import { FederationCreationSchema } from '@/v5/validation/federations';
import { FormSelect } from '@controls/formSelect/formSelect.component';
import { FormTextField } from '@controls/formTextField/formTextField.component';
import { FormModal } from '@controls/modal/formModal/formDialog.component';
import { yupResolver } from '@hookform/resolvers/yup';
import { MenuItem } from '@mui/material';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { CONTAINER_UNITS, IContainer } from '@/v5/store/containers/containers.types';
import { NewFederation } from '@/v5/store/federations/federations.types';
import { prepareNewFederation } from '@/v5/store/federations/federations.helpers';
import { FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers/federationsActions.dispatchers';
import { SectionTitle } from '../federationSettingsForm/federationSettingsForm.styles';
import { HalfWidth } from './createFederationForm.styles';
import { EditFederationModal } from '../editFederationModal/editFederationModal.component';

interface ICreateFederation {
	open: boolean;
	onClickClose: () => void;
}

const defaultValues = {
	name: '',
	unit: 'mm',
};

export const CreateFederationForm = ({ open, onClickClose }: ICreateFederation): JSX.Element => {
	const {
		handleSubmit,
		control,
		getValues,
		reset,
		formState: { errors, isValid, isSubmitSuccessful },
	} = useForm<NewFederation>({
		defaultValues,
		mode: 'onChange',
		resolver: yupResolver(FederationCreationSchema),
	});
	const { teamspace, project } = useParams() as { teamspace: string, project: string };
	const [modalPhase, setModalPhase] = useState('settings');
	const [containers, setContainers] = useState([]);

	const closeAndReset = (): void => {
		onClickClose();
		reset();
		setModalPhase('settings');
	};

	useEffect(() => {
		if (isSubmitSuccessful && (modalPhase === 'settings')) closeAndReset();
	}, [open, reset]);

	const onClickBack = (): void => {
		setModalPhase('settings');
	};

	const onClickContinue = (): void => {
		if (modalPhase === 'settings') {
			setModalPhase('edit');
		}
	};

	const onClickSubmit = (newFederation: NewFederation): void => {
		FederationsActionsDispatchers.createFederation(teamspace, project, newFederation, containers);
		onClickClose();
		setModalPhase('settings');
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
			isValid={isValid}
			open={open}
			onClickClose={closeAndReset}
			{...(modalPhase === 'settings' ? SettingsModalProps : EditModalProps)}
		>
			{modalPhase === 'settings' ? (
				<>
					<SectionTitle>
						<FormattedMessage
							id="createFederation.form.informationTitle"
							defaultMessage="Federation information"
						/>
					</SectionTitle>
					<FormTextField
						name="name"
						control={control}
						label={formatMessage({ id: 'createFederation.form.name', defaultMessage: 'Name' })}
						required
						formError={errors.name}
					/>
					<FormTextField
						name="desc"
						control={control}
						label={formatMessage({ id: 'createFederation.form.desc', defaultMessage: 'Description' })}
						formError={errors.desc}
					/>
					<HalfWidth>
						<FormSelect
							required
							name="unit"
							label={formatMessage({
								id: 'createFederation.form.unit',
								defaultMessage: 'Units',
							})}
							control={control}
						>
							{CONTAINER_UNITS.map(({ name, value }) => (
								<MenuItem key={value} value={value}>
									{name}
								</MenuItem>
							))}
						</FormSelect>
					</HalfWidth>
					<FormTextField
						name="code"
						control={control}
						label={formatMessage({ id: 'createFederation.form.code', defaultMessage: 'Code' })}
						formError={errors.code}
					/>
				</>
			) : (
				<EditFederationModal
					federation={prepareNewFederation(getValues())}
					isNewFederation
					onContainersChange={(includedContainers: IContainer[]) => setContainers(
						includedContainers.map((container) => container._id),
					)}
				/>
			)}
		</FormModal>
	);
};
