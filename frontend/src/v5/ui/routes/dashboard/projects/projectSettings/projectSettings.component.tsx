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
import { isFileFormatUnsupported, isPathNotFound, projectAlreadyExists } from '@/v5/validation/errors.helpers';
import { ProjectSchema } from '@/v5/validation/projectSchemes/projectsSchemes';
import { UnhandledErrorInterceptor } from '@controls/errorMessage/unhandledErrorInterceptor/unhandledErrorInterceptor.component';
import { FormTextField } from '@controls/inputs/formInputs.component';
import { yupResolver } from '@hookform/resolvers/yup';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm, FormProvider } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { dirtyValues } from '@/v5/helpers/form.helper';
import { InputController } from '@controls/inputs/inputController.component';
import { getProjectImgSrc, DEFAULT_PROJECT_IMAGE } from '@/v5/store/projects/projects.helpers';
import { getWaitablePromise } from '@/v5/helpers/async.helpers';
import { testImageExists } from '@controls/fileUploader/imageFile.helper';
import { Gap } from '@controls/gap';
import { Form, Section, Header, SubmitButton, SuccessMessage, ImageInfo } from './projectSettings.styles';
import { ProjectImageInput } from './projectImageInput/projectImageInput.component';
import { deleteAuthUrlFromCache } from '@/v5/helpers/download.helper';

type IFormInput = {
	name: string,
	image?: string | File,
};

export const ProjectSettings = () => {
	const [existingNames, setExistingNames] = useState([]);
	const [showSuccessMessage, setShowSuccessMessage] = useState(false);

	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const currentProject = ProjectsHooksSelectors.selectCurrentProjectDetails();

	const { name = '', _id: projectId, isAdmin } = currentProject;
	const imgSrcAsUrl = getProjectImgSrc(teamspace, projectId);

	const formData = useForm<IFormInput>({
		mode: 'onChange',
		resolver: yupResolver(ProjectSchema),
		context: { existingNames },
		defaultValues: { name, image: null },
	});

	const {
		formState: { errors, isValid, dirtyFields, isSubmitting, isDirty },
		handleSubmit,
		setError,
		getValues,
		reset,
		trigger,
	} = formData;

	const onSubmitError = (error) => {
		if (projectAlreadyExists(error)) {
			setExistingNames(existingNames.concat(getValues('name')));
		}
		if (isFileFormatUnsupported(error)) {
			setError('image', {
				type: 'custom',
				message: formatMessage({
					id: 'project.settings.image.error.format',
					defaultMessage: 'The file format is not supported',
				}),
			});
		}
	};

	const onSubmit: SubmitHandler<IFormInput> = async (body) => {
		const { promiseToResolve, resolve, reject } = getWaitablePromise();
		const updatedProject = dirtyValues(body, dirtyFields);

		ProjectsActionsDispatchers.updateProject(
			teamspace,
			projectId,
			updatedProject,
			resolve,
			reject,
		);
		await promiseToResolve;
		setShowSuccessMessage(true);
		const resetBody = { ...body };
		if ('image' in updatedProject) {
			deleteAuthUrlFromCache(imgSrcAsUrl);
			resetBody.image = (updatedProject.image === null) ? null : imgSrcAsUrl;
		}
		reset(resetBody);
	};

	useEffect(() => {
		if (showSuccessMessage && isDirty) {
			setShowSuccessMessage(false);
		}
	}, [isDirty]);

	useEffect(() => {
		if (projectId === undefined || isAdmin === undefined) return;
		setExistingNames([]);
		setShowSuccessMessage(false);
		testImageExists(imgSrcAsUrl)
			.then(() => reset({ name, image: imgSrcAsUrl }))
			.catch(() => reset({ name, image: isAdmin ? null : DEFAULT_PROJECT_IMAGE }));
	}, [projectId, isAdmin]);

	useEffect(() => {
		if (existingNames.length) { 
			trigger('name');
		}
	}, [existingNames]);

	if (!projectId) return (<></>);

	return (
		<FormProvider {...formData}>
			<Form onSubmit={(event) => handleSubmit(onSubmit)(event).catch(onSubmitError)}>
				<Section>
					<Header>
						<FormattedMessage id="project.settings.form.information" defaultMessage="Information" />
					</Header>
					<FormTextField
						required
						name="name"
						label={formatMessage({ id: 'project.settings.form.name', defaultMessage: 'Name' })}
						formError={errors.name}
						disabled={!isAdmin}
					/>
				</Section>
				<Section>
					<Header>
						<FormattedMessage id="project.settings.form.image" defaultMessage="Project image" />
					</Header>
					<Gap $height="8px" />
					{isAdmin && (
						<ImageInfo>
							<FormattedMessage
								id="project.settings.form.image.description"
								defaultMessage="An image will help people to recognise the project."
							/>
						</ImageInfo>
					)}
					<InputController
						Input={ProjectImageInput}
						name='image'
						disabled={!isAdmin}
						formError={errors?.image}
					/>
				</Section>
				{isAdmin && (
					<SubmitButton
						disabled={_.isEmpty(dirtyFields) || !isValid || !_.isEmpty(errors)}
						isPending={isSubmitting}
					>
						<FormattedMessage id="project.settings.form.saveChanges" defaultMessage="Save changes" />
					</SubmitButton>
				)}
				{showSuccessMessage && (
					<SuccessMessage>
						<FormattedMessage id="project.settings.form.successMessage" defaultMessage="The project has been updated successfully." />
					</SuccessMessage>
				)}
				<UnhandledErrorInterceptor expectedErrorValidators={[projectAlreadyExists, isFileFormatUnsupported, isPathNotFound]} />
			</Form>
		</FormProvider>
	);
};
