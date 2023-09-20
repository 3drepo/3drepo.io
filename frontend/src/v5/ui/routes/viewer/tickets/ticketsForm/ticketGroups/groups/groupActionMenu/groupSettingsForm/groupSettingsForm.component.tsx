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

/* eslint-disable no-param-reassign */
import { formatMessage } from '@/v5/services/intl';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { FormTextField } from '@controls/inputs/formInputs.component';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { SubmitButton } from '@controls/submitButton';
import { Button } from '@controls/button';
import { useEffect, useRef, useState } from 'react';
import { GroupSettingsSchema } from '@/v5/validation/groupSchemes/groupSchemes';
import { yupResolver } from '@hookform/resolvers/yup';
import { cloneDeep, isEqual, isUndefined, omitBy, sortBy } from 'lodash';
import { ActionMenuItem } from '@controls/actionMenu';
import { Group, IGroupSettingsForm } from '@/v5/store/tickets/tickets.types';
import { InputController } from '@controls/inputs/inputController.component';
import { EmptyCardMessage } from '@components/viewer/cards/card.styles';
import { ColorPicker } from '@controls/inputs/colorPicker/colorPicker.component';
import { useSelector } from 'react-redux';
import { selectSelectedNodes } from '@/v4/modules/tree/tree.selectors';
import { convertToV4GroupNodes, convertToV5GroupNodes, meshObjectsToV5GroupNode } from '@/v5/helpers/viewpoint.helpers';
import { getRandomSuggestedColor } from '@controls/inputs/colorPicker/colorPicker.helpers';
import { Gap } from '@controls/gap';
import { hexToArray } from '@/v4/helpers/colors';
import { getMeshIDsByQuery } from '@/v4/services/api';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { useParams } from 'react-router-dom';
import { GroupsCollectionSelect } from '../../addOrEditGroup/groupSettingsForm.component.tsx/groupsCollectionSelect/groupsCollectionSelect.component';
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
	TriggerButton,
	FormRulesBox,
	NewCollectionActionMenu,
	ObjectsCount,
} from './groupSettingsForm.styles';
import { GroupRulesForm } from '../../groupRulesForm/groupRulesForm.component';
import { ChipRule } from '../../groupRulesForm/chipRule/chipRule.component';
import { NewCollectionForm } from '../newCollectionForm/newCollectionForm.component';
import { RulesOptionsMenu } from './rulesOptionsMenu/rulesOptionsMenu.component';
import { RulesField } from './rulesField/ruelsField.component';
import { Popper } from '../../../ticketGroups.styles';

type GroupSettingsFormProps = {
	value?: IGroupSettingsForm,
	onSubmit?: (value: IGroupSettingsForm) => void,
	onCancel?: () => void,
	prefixes: string[][],
	isColored?: boolean,
};
export const GroupSettingsForm = ({ value, onSubmit, onCancel, prefixes, isColored }: GroupSettingsFormProps) => {
	const [isSmart, setIsSmart] = useState(true);
	const [newPrefix, setNewPrefix] = useState([]);
	const [filterMenuCoords, setFilterMenuCoords] = useState({ left: 0, bottom: 0 });
	const [filterMenuOpen, setFilterMenuOpen] = useState(false);
	const [inputObjects, setInputObjects] = useState([]);
	const [isPastingRules, setIsPastingRules] = useState(false);
	const [selectedRule, setSelectedRule] = useState(null);
	const isAdmin = !TicketsCardHooksSelectors.selectReadOnly();
	const { teamspace, containerOrFederation, revision } = useParams<ViewerParams>();
	const formRef = useRef(null);

	const isNewGroup = !value;
	const selectedNodes = useSelector(selectSelectedNodes);

	const formData = useForm<IGroupSettingsForm>({
		mode: 'onChange',
		resolver: yupResolver(GroupSettingsSchema),
		context: { isSmart },
	});

	const { fields: rules, append, remove, update } = useFieldArray({
		control: formData.control,
		name: 'group.rules',
	});

	const {
		handleSubmit,
		formState: { errors, isValid, isDirty },
		setValue,
		getValues,
	} = formData;

	const getFormIsValid = () => {
		if (!isValid) return false;
		if (isSmart) return isDirty;
		if (!selectedNodes.length) return false;
		const objectsAreDifferent = !isEqual(
			sortBy(selectedNodes),
			inputObjects,
		);
		return (isDirty || objectsAreDifferent);
	};

	const onClickSubmit = async (newValues:IGroupSettingsForm) => {
		if (!isSmart) {
			delete newValues.group.rules;
			newValues.group.objects = convertToV5GroupNodes(selectedNodes);
		} else if (!isEqual(newValues.group?.rules, value?.group?.rules)) {
			const { data } = await getMeshIDsByQuery(teamspace, containerOrFederation, newValues.group.rules, revision);
			newValues.group.objects = meshObjectsToV5GroupNode(data);
		}

		if (!newValues.color) {
			delete newValues.color;
		}

		if (newValues.color && newValues.opacity === 1) {
			delete newValues.opacity;
		}

		onSubmit?.(omitBy(newValues, isUndefined) as IGroupSettingsForm);
	};

	const handleNewCollectionChange = (collection: string[]) => {
		setNewPrefix([collection]);
		setValue('prefix', collection, { shouldDirty: true });
	};

	const handlePasteRules = (pastedRules) => {
		setIsPastingRules(false);
		append(pastedRules);
	};

	const resetFilterMenu = () => {
		setSelectedRule(null);
		setFilterMenuOpen(false);
	};

	useEffect(() => {
		// When no value is passed then the group is a new group
		resetFilterMenu();
		if (!value) {
			formData.reset({
				...(isColored ? { color: hexToArray(getRandomSuggestedColor()) } : {}),
				opacity: 1,
				prefix: [],
				group: {},
			});
			setIsSmart(true);
			return;
		}

		const { objects, ...restGroup } = value.group as Group;
		const newValue = cloneDeep({ ...value, group: restGroup });
		formData.reset(newValue);
		setIsSmart(!!value?.group?.rules?.length);
		setInputObjects(convertToV4GroupNodes(value?.group?.objects));
		setIsPastingRules(false);
	}, [value]);

	useEffect(() => {
		if (!formRef.current) return;
		const viewportHeight = window.innerHeight;
		const PADDING = 14;
		const rect = formRef.current.getBoundingClientRect();
		setFilterMenuCoords({
			bottom: viewportHeight - rect.y - rect.height - PADDING,
			left: rect.x + rect.width + PADDING,
		});
	}, []);
	return (
		<form ref={formRef}>
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
							name="group.name"
							label={formatMessage({
								id: 'ticketsGroupSettings.form.title',
								defaultMessage: 'Title',
							})}
							required
							formError={errors?.group?.name}
							disabled={!isAdmin}
						/>
						{isColored && (
							<ColorPicker
								onChange={({ color, opacity }) => {
									setValue('color', color, { shouldDirty: true });
									setValue('opacity', opacity, { shouldDirty: true });
								}}
								value={({ color: getValues('color'), opacity: getValues('opacity') })}
								disabled={!isAdmin}
							/>
						)}
					</LabelAndColor>
					<FormRow>
						<FormTextField
							name="group.description"
							label={formatMessage({
								id: 'ticketsGroupSettings.form.description',
								defaultMessage: 'Description',
							})}
							formError={errors?.group?.description}
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
							prefixes={prefixes.concat(newPrefix).sort()}
						/>
					</FormRow>
					{
						isAdmin && (
							<NewCollectionActionMenu
								TriggerButton={(
									<NewCollectionLink>
										{newPrefix?.length ? (
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
									value={newPrefix}
									onChange={handleNewCollectionChange}
									prefixesCombinations={prefixes}
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
					{isAdmin && isSmart && (
						<Instruction>
							<FormattedMessage
								id="ticketsGroupSettings.smartGroupInstruction"
								defaultMessage="Use filters below to create smart group"
							/>
						</Instruction>
					)}
					{isAdmin && !isSmart && (
						<Instruction>
							<FormattedMessage
								id="ticketsGroupSettings.manualGroupInstruction"
								defaultMessage="Select objects to include in this group"
							/>
						</Instruction>
					)}
				</FormBox>
				{!isSmart && (
					<Subheading>
						<span>
							<FormattedMessage
								id="ticketsGroupSettings.subHeading.selectedObjects"
								defaultMessage="Selected Objects"
							/>
							<ObjectsCount>{selectedNodes.length}</ObjectsCount>
						</span>
					</Subheading>
				)}
				{
					isSmart && (
						<>
							<Popper
								open={filterMenuOpen}
								style={{ /* style is required to override the default positioning style Popper gets */
									top: 'unset',
									right: 'unset',
									width: 'auto',
									...filterMenuCoords,
								}}
							>
								<GroupRulesForm
									rule={selectedRule?.value}
									onSave={selectedRule ? (val) => update(selectedRule.index, val) : append}
									onClose={resetFilterMenu}
									existingRules={value?.group?.rules}
								/>
							</Popper>
							<Subheading>
								<FormattedMessage
									id="ticketsGroupSettings.subHeading.filters"
									defaultMessage="Filters"
								/>
								{isAdmin && (
									<AddFilterTitle>
										<TriggerButton onClick={() => setFilterMenuOpen(true)}>
											<FormattedMessage id="tickets.groups.newGroupForm.addFilter" defaultMessage="Add filter" />
										</TriggerButton>
									</AddFilterTitle>
								)}
							</Subheading>
							<FormRulesBox>
								<RulesOptionsMenu value={rules} onPaste={() => setIsPastingRules(true)} onClear={() => { remove(); resetFilterMenu(); }} />
								{isPastingRules && (<RulesField onSubmit={handlePasteRules} onClose={() => setIsPastingRules(false)} />)}
								{isPastingRules && rules.length > 0 && (<Gap $height="5px" />)}
								<Rules>
									{rules.map(({ id, ...ruleValue }, i) => (
										<ChipRule
											label={ruleValue.name}
											key={id}
											isSelected={selectedRule === ruleValue}
											onDelete={() => {
												remove(i);
												resetFilterMenu();
											}}
											disabled={!isAdmin}
											onClick={() => {
												if (filterMenuOpen) return;
												setSelectedRule({ index: i, value: ruleValue });
												setFilterMenuOpen(true);
											}}
										/>
									))}
									{!rules.length && !isPastingRules && (
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
						<Button variant="text" color="secondary" size="medium" onClick={onCancel}>
							<FormattedMessage id="tickets.groups.settings.cancel" defaultMessage="Cancel" />
						</Button>
					</ActionMenuItem>
					{ isAdmin && (
						<ActionMenuItem>
							<SubmitButton
								size="medium"
								fullWidth={false}
								onClick={handleSubmit(onClickSubmit)}
								disabled={!getFormIsValid()}
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
