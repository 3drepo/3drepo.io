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
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm, FormProvider } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { dirtyValues } from '@/v5/helpers/form.helper';
import { InputController } from '@controls/inputs/inputController.component';
import { getProjectImgSrc } from '@/v5/store/projects/projects.helpers';
import { Form, Section, Header, SubmitButton, SuccessMessage, ImageInfo } from './projectSettings.styles';
import { ProjectImageInput } from './projectImageInput/projectImageInput.component';
import { testImageExists } from '@controls/fileUploader/imageFile.helper';

type IFormInput = {
	name: string,
	image?: string | File,
};
export const ProjectSettings = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitWasSuccessful, setSubmitWasSuccessful] = useState(false);
	const [existingNames, setExistingNames] = useState([]);
	const [imageWasTested, setImgWasTested] = useState(false);

	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const currentProject = ProjectsHooksSelectors.selectCurrentProjectDetails();
	const { name = '', _id: projectId } = currentProject;
	const defaultValues = useRef({ name, image: '' });

	const formData = useForm<IFormInput>({
		mode: 'onChange',
		resolver: yupResolver(ProjectSchema),
		context: { existingNames },
		defaultValues: defaultValues.current,
	});

	const {
		control,
		formState: { errors, isValid, dirtyFields },
		handleSubmit,
		getValues,
		reset,
		trigger,
	} = formData;

	const onSubmitError = (error) => {
		setSubmitWasSuccessful(false);
		if (projectAlreadyExists(error)) {
			setExistingNames(existingNames.concat(getValues('name')));
		}
	};

	const onSubmit: SubmitHandler<IFormInput> = (body) => {
		setIsSubmitting(true);

		const projectUpdate = dirtyValues(body, dirtyFields);
		ProjectsActionsDispatchers.updateProject(
			teamspace,
			projectId,
			projectUpdate,
			() => setSubmitWasSuccessful(true),
			onSubmitError,
		);
		setIsSubmitting(false);
	};

	useEffect(() => {
		setSubmitWasSuccessful(false);
		reset(defaultValues.current);
	}, [currentProject]);

	useEffect(() => {
		setImgWasTested(false);
		if (!teamspace || !projectId) return;
		const imgSrc = getProjectImgSrc(teamspace, projectId);
		testImageExists(imgSrc).then((exists) => {
			setImgWasTested(true);
			if (!exists) return;
			defaultValues.current.image = imgSrc;
			reset(defaultValues.current);
		});
	}, [teamspace, projectId]);

	useEffect(() => {
		if (existingNames.length) { 
			trigger('name');
		}
	}, [existingNames]);

	if (_.isEmpty(projectId)) return (<></>);

	return (
		<FormProvider {...formData}>
			<Form onSubmit={handleSubmit(onSubmit)}>
				<button type='button' onClick={() => console.log(formData)}>logState</button>
				<Section>
					<Header>
						<FormattedMessage id="project.settings.form.information" defaultMessage="Information" />
					</Header>
					<FormTextField
						required
						name="name"
						label={formatMessage({ id: 'project.settings.form.name', defaultMessage: 'Name' })}
						control={control}
						formError={errors.name}
						disabled={!currentProject.isAdmin}
					/>
				</Section>
				<Section>
					<Header>
						<FormattedMessage id="project.settings.form.image" defaultMessage="Project image" />
					</Header>
					<ImageInfo>
						<FormattedMessage
							id="project.settings.form.image.description"
							defaultMessage="An image will help people to recognise the project."
						/>
					</ImageInfo>
					{imageWasTested && (
						<InputController
							Input={ProjectImageInput}
							name='image'
						/>
					)}
				</Section>
				<SubmitButton
					disabled={_.isEmpty(dirtyFields) || !isValid || !currentProject.isAdmin}
					isPending={isSubmitting}
				>
					<FormattedMessage id="project.settings.form.saveChanges" defaultMessage="Save changes" />
				</SubmitButton>
			</Form>
			{submitWasSuccessful && (
				<SuccessMessage>
					<FormattedMessage id="project.settings.form.successMessage" defaultMessage="The project has been updated successfully." />
				</SuccessMessage>
			)}
			<UnhandledErrorInterceptor expectedErrorValidators={[projectAlreadyExists]} />
		</FormProvider>
	);
};
