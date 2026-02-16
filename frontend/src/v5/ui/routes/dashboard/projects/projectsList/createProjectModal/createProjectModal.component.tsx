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
import { formatMessage } from '@/v5/services/intl';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormModal } from '@controls/formModal/formModal.component';
import { useForm, FormProvider } from 'react-hook-form';
import { DialogsActionsDispatchers, ProjectsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ProjectSchema } from '@/v5/validation/projectSchemes/projectsSchemes';
import { TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { isFileFormatUnsupported, projectAlreadyExists } from '@/v5/validation/errors.helpers';
import { UnhandledErrorInterceptor } from '@controls/errorMessage/unhandledErrorInterceptor/unhandledErrorInterceptor.component';
import { FormTextField } from '@controls/inputs/formInputs.component';
import { TextField } from '@controls/inputs/textField/textField.component';
import { InputController } from '@controls/inputs/inputController.component';
import { Gap } from '@controls/gap';
import { getWaitablePromise } from '@/v5/helpers/async.helpers';
import { projectTabRoute } from '@/v5/services/routing/routing';
import { useNavigate } from 'react-router-dom';
import { ProjectImageInput } from '../../projectSettings/projectImageInput/projectImageInput.component';

interface CreateProjectModalProps {
	open: boolean;
	onClickClose: () => void;
}

interface IFormInput {
	name: string;
	image?: File;
}

export const CreateProjectModal = ({ open, onClickClose }: CreateProjectModalProps) => {
	const currentTeamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const [existingNames, setExistingNames] = useState([]);
	const navigate = useNavigate();

	const formData = useForm<IFormInput>({
		mode: 'onChange',
		resolver: yupResolver(ProjectSchema),
		context: { existingNames },
		defaultValues: { name: '', image: null },
	});

	const {
		formState,
		formState: { errors, isSubmitting },
		handleSubmit,
		getValues,
		trigger,
	} = formData;

	const onSubmissionError = ({ error, projectId }) => {
		if (projectAlreadyExists(error)) {
			setExistingNames((currentValue) => [...currentValue, getValues('name')]);
		}
		if (isFileFormatUnsupported(error)) {
			onClickClose();
			DialogsActionsDispatchers.open('warning', {
				title: formatMessage({
					id: 'project.creation.warning.imageNotSaved.title',
					defaultMessage: 'Image creation error!',
				}),
				message: formatMessage({
					id: 'project.creation.warning.imageNotSaved.message',
					defaultMessage: `
						Your project has been created successfully, but we encountered an issue {breakLine}
						with processing the image. To add a different image, please visit {breakLine}
						the project page and choose a file in a supported format.
					`,
				}, { breakLine: <br /> }),
				secondaryButtonLabel: formatMessage({
					id: 'project.creation.warning.imageNotSaved.openProject',
					defaultMessage: 'Open Project',
				}),
				onClickSecondary: () => navigate(projectTabRoute(currentTeamspace, projectId, 'project_settings')),
			});
		}
	};

	const onSubmit = async (body) => {
		const { promiseToResolve, resolve, reject } = getWaitablePromise();
		const data = {
			...body,
			name: body.name.trim(),
		};
		ProjectsActionsDispatchers.createProject(
			currentTeamspace,
			data,
			// onSuccess
			resolve,
			// onImageError
			(error, projectId) => reject({ error, projectId }),
			// onError
			(error) => reject({ error }),
		);
		await promiseToResolve;
		onClickClose();
	};

	useEffect(() => {
		if (existingNames.length) trigger('name');
	}, [errors, JSON.stringify(existingNames)]);

	return (
		<FormProvider {...formData}>
			<FormModal
				title={formatMessage({ id: 'project.creation.form.title', defaultMessage: 'Create new Project' })}
				open={open}
				onClickClose={onClickClose}
				onSubmit={(event) => handleSubmit(onSubmit)(event).catch(onSubmissionError)}
				confirmLabel={formatMessage({ id: 'project.creation.form.createButton', defaultMessage: 'Create Project' })}
				isValid={formState.isValid}
				isSubmitting={isSubmitting}
				maxWidth="sm"
			>
				<TextField
					label={formatMessage({ id: 'project.creation.form.teamspace', defaultMessage: 'Teamspace' })}
					value={currentTeamspace}
					disabled
				/>
				<FormTextField
					required
					name="name"
					label={formatMessage({ id: 'project.creation.form.name', defaultMessage: 'Project name' })}
					formError={errors.name}
				/>
				<Gap $height="28px" />
				<InputController
					Input={ProjectImageInput}
					name="image"
					formError={errors.image}
				/>
				<UnhandledErrorInterceptor expectedErrorValidators={[projectAlreadyExists, isFileFormatUnsupported]} />
			</FormModal>
		</FormProvider>
	);
};
