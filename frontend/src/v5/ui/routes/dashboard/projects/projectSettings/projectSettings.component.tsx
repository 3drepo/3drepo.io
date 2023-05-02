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

import { ProjectsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { formatMessage } from '@/v5/services/intl';
import { ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { projectAlreadyExists } from '@/v5/validation/errors.helpers';
import { ProjectSchema } from '@/v5/validation/projectSchemes/projectsSchemes';
import { UnhandledErrorInterceptor } from '@controls/errorMessage/unhandledErrorInterceptor/unhandledErrorInterceptor.component';
import { FormTextField } from '@controls/inputs/formInputs.component';
import { yupResolver } from '@hookform/resolvers/yup';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { Form, SubmitButton, SuccessMessage } from './projectSettings.styles';

type IFormInput = {
	projectName: string,
};
export const ProjectSettings = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitWasSuccessful, setSubmitWasSuccessful] = useState(false);
	const [existingNames, setExistingNames] = useState([]);

	const currentTeamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const currentProject = ProjectsHooksSelectors.selectCurrentProjectDetails();

	const defaultValues = { projectName: currentProject.name || '' };
	const {
		control,
		formState: { errors, isValid, dirtyFields },
		handleSubmit,
		getValues,
		reset,
		trigger,
	} = useForm<IFormInput>({
		mode: 'onChange',
		resolver: yupResolver(ProjectSchema),
		context: { existingNames },
		defaultValues,
	});

	const onSubmitError = (error) => {
		setSubmitWasSuccessful(false);
		if (projectAlreadyExists(error)) {
			const { projectName } = getValues();
			setExistingNames(existingNames.concat(projectName));
		}
	};

	const onSubmit: SubmitHandler<IFormInput> = ({ projectName }) => {
		setIsSubmitting(true);
		const projectUpdate = { name: projectName.trim() };
		ProjectsActionsDispatchers.updateProject(
			currentTeamspace,
			currentProject._id,
			projectUpdate,
			() => setSubmitWasSuccessful(true),
			onSubmitError,
		);
		setIsSubmitting(false);
	};

	useEffect(() => {
		reset(defaultValues);
		setSubmitWasSuccessful(false);
	}, [currentProject]);

	useEffect(() => {
		if (existingNames.length) trigger('projectName');
	}, [existingNames.length]);

	if (_.isEmpty(currentProject)) return (<></>);

	return (
		<>
			<Form onSubmit={handleSubmit(onSubmit)}>
				<FormTextField
					required
					name="projectName"
					label={formatMessage({ id: 'project.settings.form.name', defaultMessage: 'Project name' })}
					control={control}
					formError={errors.projectName}
					disabled={!currentProject.isAdmin}
				/>
				<SubmitButton
					disabled={_.isEmpty(dirtyFields) || !isValid || !currentProject.isAdmin}
					isPending={isSubmitting}
				>
					<FormattedMessage id="project.settings.form.save" defaultMessage="Save" />
				</SubmitButton>
			</Form>
			{submitWasSuccessful && (
				<SuccessMessage>
					<FormattedMessage id="project.settings.form.successMessage" defaultMessage="The project has been updated successfully." />
				</SuccessMessage>
			)}
			<UnhandledErrorInterceptor expectedErrorValidators={[projectAlreadyExists]} />
		</>
	);
};
