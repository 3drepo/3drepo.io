/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { formatMessage } from '@/v5/services/intl';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { FormTextField, FormToggle } from '@controls/inputs/formInputs.component';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';
import { SubmitButton } from '@controls/submitButton';
import { Button } from '@controls/button';
import { Buttons, FormBox, Heading, Instruction, CreateCollectionLink, Subheading } from './groupSettingsForm.styles';

type IFormInput = {
	title: string;
};

type IGroupSettingsForm = {
	defaultValues?: any;
};

export const GroupSettingsForm = ({ defaultValues }: IGroupSettingsForm) => {
	const {
		control,
		handleSubmit,
		formState: { errors, isValid, isDirty },
	} = useForm<IFormInput>({
		mode: 'onChange',
		// resolver: yupResolver(CreateContainerSchema), TODO Create Resolver
		defaultValues,
	});
	const isAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const isNewGroup = !!get(defaultValues, '_id');

	const onSubmit = (args) => {
		console.log({ args });
	};
	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Heading>
				{isNewGroup ? (
					<FormattedMessage
						id="ticketsGroupSettings.heading.addGroup"
						defaultMessage="Add new group"
					/>
				) : (
					<FormattedMessage
						id="ticketsGroupSettings.heading.editGroup"
						defaultMessage="Edit group"
					/>
				)}
			</Heading>
			<Subheading>
				<FormattedMessage
					id="ticketsGroupSettings.subHeading.groupInformation"
					defaultMessage="Group information"
				/>
			</Subheading>
			<FormBox>
				<FormTextField
					control={control}
					name="title"
					label={formatMessage({
						id: 'ticketsGroupSettings.form.label',
						defaultMessage: 'Label',
					})}
					required
					formError={errors.label}
					disabled={!isAdmin}
				/>
				<FormTextField
					control={control}
					name="desc"
					label={formatMessage({
						id: 'ticketsGroupSettings.form.desc',
						defaultMessage: 'Description',
					})}
					formError={errors.desc}
					disabled={!isAdmin}
				/>
				<FormTextField
					control={control}
					name="collection"
					label={formatMessage({
						id: 'ticketsGroupSettings.form.collection',
						defaultMessage: 'Add group to collection',
					})}
					formError={errors.collection}
					disabled={!isAdmin}
				/>
				<CreateCollectionLink>
					<FormattedMessage
						id="ticketsGroupSettings.link.createCollection"
						defaultMessage="Create new collection"
					/>
				</CreateCollectionLink>
			</FormBox>
			<Subheading>
				<FormattedMessage
					id="ticketsGroupSettings.subHeading.groupType"
					defaultMessage="Group type"
				/>
			</Subheading>
			<FormBox>
				<FormToggle
					control={control}
					name="type"
					label={formatMessage({
						id: 'ticketsGroupSettings.form.type',
						defaultMessage: 'Manual Group',
					})}
					formError={errors.type}
					disabled={!isAdmin}
				/>
				<Instruction>
					<FormattedMessage
						id="ticketsGroupSettings.smartGroupInstruction"
						defaultMessage="Use filters below to create smart group"
					/>
				</Instruction>
			</FormBox>
			<Subheading>
				<FormattedMessage
					id="ticketsGroupSettings.subHeading.filters"
					defaultMessage="Filters"
				/>
			</Subheading>
			<FormBox>
				Filters here!
			</FormBox>
			<Buttons>
				<Button variant="text" color="secondary">
					<FormattedMessage id="tickets.groups.settings.cancel" defaultMessage="Cancel" />
				</Button>
				<SubmitButton
					variant="contained"
					color="primary"
					fullWidth={false}
					disabled={!isValid || !isDirty}
				>
					{isNewGroup ? (
						<FormattedMessage id="tickets.groups.settings.createGroup" defaultMessage="Create group" />

					) : (
						<FormattedMessage id="tickets.groups.settings.updateGroup" defaultMessage="Update group" />
					)}
				</SubmitButton>
			</Buttons>
		</form>
	);
};
