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
import { FormColorPicker, FormTextField } from '@controls/inputs/formInputs.component';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { SubmitButton } from '@controls/submitButton';
import { Button } from '@controls/button';
import { IGroupSettingsForm } from '@/v5/store/tickets/groups/ticketGroups.types';
import { useContext, useState } from 'react';
import { Toggle } from '@controls/inputs/toggle/toggle.component';
import { GroupSettingsSchema } from '@/v5/validation/groupSchemes/groupSchemes';
import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from 'lodash';
import { Buttons, LabelAndColor, FormBox, Heading, Instruction, CreateCollectionLink, Subheading } from './groupSettingsForm.styles';
import { TicketGroupsContext } from '../../../ticketGroupsContext';

export const GroupSettingsForm = ({ defaultValues }: { defaultValues: IGroupSettingsForm }) => {
	const [isSmart, setIsSmart] = useState(!!defaultValues?.rules?.length);
	const isHidden = useContext(TicketGroupsContext).groupType === 'hidden';
	const {
		control,
		handleSubmit,
		formState: { errors, isValid, dirtyFields },
	} = useForm<IGroupSettingsForm>({
		mode: 'onChange',
		resolver: yupResolver(GroupSettingsSchema),
		defaultValues,
	});
	const isAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const isNewGroup = !defaultValues?._id;

	const onSubmit: SubmitHandler<IGroupSettingsForm> = (args) => {
		console.log({ args, isHidden });
	};
	return (
		<form>
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
				<LabelAndColor>
					<FormTextField
						control={control}
						name="name"
						label={formatMessage({
							id: 'ticketsGroupSettings.form.label',
							defaultMessage: 'Label',
						})}
						required
						formError={errors?.name}
						disabled={!isAdmin}
					/>
					<FormColorPicker
						control={control}
						name="color"
						formError={errors?.color}
						disabled={!isAdmin}
					/>
				</LabelAndColor>
				<FormTextField
					control={control}
					name="description"
					label={formatMessage({
						id: 'ticketsGroupSettings.form.description',
						defaultMessage: 'Description',
					})}
					formError={errors?.description}
					disabled={!isAdmin}
				/>
				<FormTextField
					control={control}
					name="prefix"
					label={formatMessage({
						id: 'ticketsGroupSettings.form.collection',
						defaultMessage: 'Add group to collection',
					})}
					formError={errors?.prefix}
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
				<Toggle
					value={isSmart}
					label={formatMessage({
						id: 'ticketsGroupSettings.form.type',
						defaultMessage: 'Manual Group',
					})}
					onClick={() => setIsSmart((prev) => !prev)}
					disabled={!isAdmin}
				/>
				<Instruction>
					<FormattedMessage
						id="ticketsGroupSettings.smartGroupInstruction"
						defaultMessage="Use filters below to create smart group"
					/>
				</Instruction>
			</FormBox>
			{
				isSmart && (
					<>
						<Subheading>
							<FormattedMessage
								id="ticketsGroupSettings.subHeading.filters"
								defaultMessage="Filters"
							/>
						</Subheading>
						<FormBox>
							Filters here!
						</FormBox>
					</>
				)
			}
			<Buttons>
				<Button variant="text" color="secondary">
					<FormattedMessage id="tickets.groups.settings.cancel" defaultMessage="Cancel" />
				</Button>
				<SubmitButton
					fullWidth={false}
					onClick={handleSubmit(onSubmit)}
					disabled={!isValid || isEmpty(dirtyFields)}
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
