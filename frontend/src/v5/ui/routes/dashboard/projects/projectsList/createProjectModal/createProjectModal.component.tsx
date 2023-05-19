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
import { useForm, SubmitHandler } from 'react-hook-form';
import { ProjectsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ProjectSchema } from '@/v5/validation/projectSchemes/projectsSchemes';
import { TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { projectAlreadyExists } from '@/v5/validation/errors.helpers';
import { UnhandledErrorInterceptor } from '@controls/errorMessage/unhandledErrorInterceptor/unhandledErrorInterceptor.component';
import { FormTextField } from '@controls/inputs/formInputs.component';
import { TextField } from '@controls/inputs/textField/textField.component';

interface CreateProjectModalProps {
	open: boolean;
	onClickClose: () => void;
}

interface IFormInput {
	projectName: string;
}

export const CreateProjectModal = ({ open, onClickClose }: CreateProjectModalProps) => {
	const currentTeamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const [existingNames, setExistingNames] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const DEFAULT_VALUES = {
		projectName: '',
	};

	const {
		control,
		formState,
		formState: { errors },
		handleSubmit,
		getValues,
		trigger,
	} = useForm<IFormInput>({
		mode: 'onChange',
		resolver: yupResolver(ProjectSchema),
		context: { existingNames },
		defaultValues: DEFAULT_VALUES,
	});

	const onSubmissionError = (error) => {
		if (projectAlreadyExists(error)) {
			setExistingNames((currentValue) => [...currentValue, getValues('projectName')]);
		}
	};

	const onSubmit: SubmitHandler<IFormInput> = ({ projectName }) => {
		ProjectsActionsDispatchers.createProject(currentTeamspace, projectName.trim(), onClickClose, onSubmissionError);
		setIsSubmitting(false);
	};

	useEffect(() => {
		if (existingNames.length) trigger('projectName');
	}, [errors, JSON.stringify(existingNames)]);

	return (
		<FormModal
			title={formatMessage({ id: 'project.creation.form.title', defaultMessage: 'Create new Project' })}
			open={open}
			onClickClose={onClickClose}
			onSubmit={handleSubmit(onSubmit)}
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
				name="projectName"
				label={formatMessage({ id: 'project.creation.form.name', defaultMessage: 'Project name' })}
				control={control}
				formError={errors.projectName}
			/>
			<UnhandledErrorInterceptor expectedErrorValidators={[projectAlreadyExists]} />
		</FormModal>
	);
};
