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
import { yupResolver } from '@hookform/resolvers/yup';
import { FormModal } from '@controls/modal/formModal/formDialog.component';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ProjectSchema } from '@/v5/validation/projectSchemes/projectsSchemes';
import { FormTextField } from '@controls/formTextField/formTextField.component';
import { FormSelect } from '@controls/formSelect/formSelect.component';
import { MenuItem } from '@mui/material';
import { TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks/teamspacesSelectors.hooks';
import { projectAlreadyExists } from '@/v5/validation/errors.helpers';
import { UnhandledErrorInterceptor } from '@controls/errorMessage/unhandledErrorInterceptor/unhandledErrorInterceptor.component';
import { ProjectsActionsDispatchers } from '@/v5/services/actionsDispatchers/projectsActions.dispatchers';
import { IProject } from '@/v5/store/projects/projects.types';
import { useExistingProjectsByTeamspace } from '../baseProjectModal/useExistingProjectsByTeamspace';

interface IFormInput {
	projectName: string;
	teamspace: string;
}

interface EditProjectModalProps {
	open: boolean;
	project: IProject;
	onClickClose: () => void;
}
export const EditProjectModal = ({ open, project, onClickClose }: EditProjectModalProps) => {
	const currentTeamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const { existingProjectsByTeamspace, addProjectByTeamspace } = useExistingProjectsByTeamspace();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const DEFAULT_VALUES = {
		teamspace: currentTeamspace,
		projectName: project.name,
	};

	const {
		control,
		formState,
		formState: { errors },
		handleSubmit,
		getValues,
		watch,
	} = useForm<IFormInput>({
		mode: 'onChange',
		resolver: yupResolver(ProjectSchema),
		context: { existingProjectsByTeamspace },
		defaultValues: DEFAULT_VALUES,
	});

	const onSubmissionError = (error) => {
		if (projectAlreadyExists(error)) {
			const { teamspace, projectName } = getValues();
			addProjectByTeamspace(teamspace, projectName);
		}
	};

	const onSubmit: SubmitHandler<IFormInput> = ({ projectName }) => {
		setIsSubmitting(true);
		const projectUpdate = { name: projectName.trim() };
		ProjectsActionsDispatchers.updateProject(
			currentTeamspace,
			project._id,
			projectUpdate,
			onClickClose,
			onSubmissionError,
		);
		setIsSubmitting(false);
	};

	const nameWasChanged = () => watch('projectName').trim() !== project.name;

	return (
		<FormModal
			title={formatMessage({ id: 'project.edit.form.title', defaultMessage: 'Edit Project' })}
			open={open}
			onClickClose={onClickClose}
			onSubmit={handleSubmit(onSubmit)}
			confirmLabel={formatMessage({ id: 'project.edit.form.saveButton', defaultMessage: 'Save' })}
			isValid={formState.isValid && nameWasChanged()}
			isSubmitting={isSubmitting}
			maxWidth="sm"
		>
			<FormSelect
				required
				name="teamspace"
				label={formatMessage({ id: 'project.edit.form.teamspace', defaultMessage: 'Teamspace' })}
				control={control}
				disabled
				value={currentTeamspace}
			>
				<MenuItem key={currentTeamspace} value={currentTeamspace}>
					{currentTeamspace}
				</MenuItem>
			</FormSelect>
			<FormTextField
				required
				name="projectName"
				label={formatMessage({ id: 'project.edit.form.name', defaultMessage: 'Project name' })}
				control={control}
				formError={errors.projectName}
			/>
			<UnhandledErrorInterceptor expectedErrorValidators={[projectAlreadyExists]} />
		</FormModal>
	);
};
