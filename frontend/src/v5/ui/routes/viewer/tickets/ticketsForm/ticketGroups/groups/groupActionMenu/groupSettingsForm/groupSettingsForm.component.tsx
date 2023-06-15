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
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { SubmitButton } from '@controls/submitButton';
import { Button } from '@controls/button';
import { useContext, useState } from 'react';
import { GroupSettingsSchema } from '@/v5/validation/groupSchemes/groupSchemes';
import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty, uniqBy } from 'lodash';
import { ActionMenuItem } from '@controls/actionMenu';
import { GroupOverride, IGroupSettingsForm } from '@/v5/store/tickets/tickets.types';
import { InputController } from '@controls/inputs/inputController.component';
import { EmptyCardMessage } from '@components/viewer/cards/card.styles';
import { MOCK_DATA } from '@/v5/store/tickets/groups/ticketGroups.helpers';
import { GroupsCollectionSelect } from '../../addOrEditGroup/groupSettingsForm.component.tsx/groupsCollectionSelect/groupsCollectionSelect.component';
import { TicketGroupsContext } from '../../../ticketGroupsContext';
import {
	Buttons,
	LabelAndColor,
	FormBox,
	Heading,
	Instruction,
	NewCollectionLink,
	Subheading,
	ToggleLabel,
	ToggleWrapper,
	Toggle,
	FormRow,
	Rules,
	AddFilterTitle,
	NewRuleActionMenu,
	TriggerButton,
	FormRulesBox,
	NewCollectionActionMenu,
} from './groupSettingsForm.styles';
import { GroupRulesForm } from '../../groupRulesForm/groupRulesForm.component';
import { ChipRule } from '../../groupRulesForm/chipRule/chipRule.component';
import { NewCollectionForm } from '../newCollectionForm/newCollectionForm.component';

const getAllPrefixesCombinations = (overrides: GroupOverride[]): string[][] => {
	const prefixes = overrides.map(({ prefix }) => (prefix)).filter(Boolean);
	const uniquePrefixes = uniqBy(prefixes, JSON.stringify);
	const allPrefixesWithDuplicates: string[][] = [];

	uniquePrefixes.forEach((prefix) => {
		const usedSegments: string[] = [];
		prefix.forEach((segment) => {
			allPrefixesWithDuplicates.push(usedSegments.concat(segment));
			usedSegments.push(segment);
		});
	});

	const allPrefixes = uniqBy(allPrefixesWithDuplicates, JSON.stringify);
	return allPrefixes.sort();
};

type GroupSettingsFormProps = {
	defaultValues?: IGroupSettingsForm,
};
export const GroupSettingsForm = ({ defaultValues }: GroupSettingsFormProps) => {
	const [isSmart, setIsSmart] = useState(!!defaultValues?.rules?.length);
	const [prefixesCombinations] = useState(getAllPrefixesCombinations(MOCK_DATA.colored));
	const [newCollection, setNewCollection] = useState([]);
	const isHidden = useContext(TicketGroupsContext).groupType === 'hidden';
	const formData = useForm<IGroupSettingsForm>({
		mode: 'onChange',
		resolver: yupResolver(GroupSettingsSchema),
		defaultValues,
	});
	const { fields: rules, append, remove, update } = useFieldArray({
		control: formData.control,
		name: 'rules',
	});
	const {
		handleSubmit,
		formState: { errors, isValid, dirtyFields },
		setValue,
	} = formData;
	const isAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const isNewGroup = !defaultValues?._id;

	const onSubmit = (body: IGroupSettingsForm) => {
		// eslint-disable-next-line no-console
		console.log({ body, isHidden });
	};

	const handleNewCollectionChange = (collection: string[]) => {
		setNewCollection(collection);
		setValue('prefix', collection, { shouldDirty: true });
	};

	return (
		<form>
			<FormProvider {...formData}>
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
							name="name"
							label={formatMessage({
								id: 'ticketsGroupSettings.form.title',
								defaultMessage: 'Title',
							})}
							required
							formError={errors?.name}
							disabled={!isAdmin}
						/>
						<FormColorPicker
							name="color"
							formError={errors?.color}
							disabled={!isAdmin}
						/>
					</LabelAndColor>
					<FormRow>
						<FormTextField
							name="description"
							label={formatMessage({
								id: 'ticketsGroupSettings.form.description',
								defaultMessage: 'Description',
							})}
							formError={errors?.description}
							disabled={!isAdmin}
						/>
					</FormRow>
					<FormRow>
						<InputController
							Input={GroupsCollectionSelect}
							name="prefix"
							label={isAdmin ? formatMessage({
								id: 'ticketsGroupSettings.form.collection',
								defaultMessage: 'Add group to collection',
							}) : formatMessage({
								id: 'ticketsGroupSettings.form.collection.disabled',
								defaultMessage: 'Parent collection',
							})}
							formError={errors?.prefix}
							disabled={!isAdmin}
							prefixesCombinations={prefixesCombinations.concat([newCollection]).sort()}
						/>
					</FormRow>
					{
						isAdmin && (
							<NewCollectionActionMenu
								TriggerButton={(
									<NewCollectionLink>
										{newCollection?.length ? (
											<FormattedMessage
												id="ticketsGroupSettings.link.editCollection"
												defaultMessage="Edit new collection"
											/>
										) : (
											<FormattedMessage
												id="ticketsGroupSettings.link.createCollection"
												defaultMessage="Create new collection"
											/>
										)}
									</NewCollectionLink>
								)}
							>
								<NewCollectionForm
									value={newCollection}
									onChange={handleNewCollectionChange}
									prefixesCombinations={prefixesCombinations}
								/>
							</NewCollectionActionMenu>
						)
					}
				</FormBox>
				<Subheading>
					<FormattedMessage
						id="ticketsGroupSettings.subHeading.groupType"
						defaultMessage="Group type"
					/>
				</Subheading>
				<FormBox>
					<ToggleWrapper>
						<ToggleLabel disabled={!isAdmin} onClick={() => setIsSmart(false)}>
							<FormattedMessage id="ticketsGroupSettings.form.type.manual" defaultMessage="Manual group" />
						</ToggleLabel>
						<Toggle
							value={isSmart}
							onClick={() => setIsSmart((prev) => !prev)}
							disabled={!isAdmin}
						/>
						<ToggleLabel disabled={!isAdmin} onClick={() => setIsSmart(true)}>
							<FormattedMessage id="ticketsGroupSettings.form.type.smart" defaultMessage="Smart group" />
						</ToggleLabel>
					</ToggleWrapper>
					{
						isAdmin && (
							<Instruction>
								<FormattedMessage
									id="ticketsGroupSettings.smartGroupInstruction"
									defaultMessage="Use filters below to create smart group"
								/>
							</Instruction>
						)
					}
				</FormBox>
				{
					isSmart && (
						<>
							<Subheading>
								<FormattedMessage
									id="ticketsGroupSettings.subHeading.filters"
									defaultMessage="Filters"
								/>
								<AddFilterTitle>
									<NewRuleActionMenu
										TriggerButton={(
											<TriggerButton>
												<FormattedMessage id="tickets.groups.newGroupForm.addFilter" defaultMessage="Add filter" />
											</TriggerButton>
										)}
									>
										<GroupRulesForm onSave={append} />
									</NewRuleActionMenu>
								</AddFilterTitle>
							</Subheading>
							<FormRulesBox>
								<Rules>
									{rules.map(({ id, ...value }, i) => (
										<ChipRule
											value={value}
											key={id}
											onDelete={() => remove(i)}
											onChange={(val) => update(i, val)}
										/>
									))}
									{!rules.length && (
										<EmptyCardMessage>
											<FormattedMessage
												id="tickets.groups.newGroupForm.rules.empty"
												defaultMessage="No Filters"
											/>
										</EmptyCardMessage>
									)}
								</Rules>
							</FormRulesBox>
						</>
					)
				}
				<Buttons>
					<ActionMenuItem>
						<Button variant="text" color="secondary" size="medium">
							<FormattedMessage id="tickets.groups.settings.cancel" defaultMessage="Cancel" />
						</Button>
					</ActionMenuItem>
					{ isAdmin && (
						<ActionMenuItem>
							<SubmitButton
								size="medium"
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
						</ActionMenuItem>
					)}
				</Buttons>
			</FormProvider>
		</form>
	);
};
