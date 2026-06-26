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
import { TicketsCardHooksSelectors, TreeHooksSelectors } from '@/v5/services/selectorsHooks';
import { FormTextField } from '@controls/inputs/formInputs.component';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { SubmitButton } from '@controls/submitButton';
import { Button } from '@controls/button';
import { useContext, useEffect, useRef, useState } from 'react';
import { GroupSettingsSchema } from '@/v5/validation/groupSchemes/groupSchemes';
import { yupResolver } from '@hookform/resolvers/yup';
import { cloneDeep, isEqual, isUndefined, omitBy, sortBy, uniqBy } from 'lodash';
import { ActionMenuItem } from '@controls/actionMenu';
import { IGroupSettingsForm } from '@/v5/store/tickets/tickets.types';
import { InputController } from '@controls/inputs/inputController.component';
import { EmptyCardMessage } from '@components/viewer/cards/card.styles';
import { ColorPicker } from '@controls/inputs/colorPicker/colorPicker.component';
import { convertToV5GroupNodes, meshObjectsToV5GroupNode } from '@/v5/helpers/viewpoint.helpers';
import { getRandomSuggestedColor } from '@controls/inputs/colorPicker/colorPicker.helpers';
import { Gap } from '@controls/gap';
import { getMeshIDsByQuery } from '@/v4/services/api';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { useParams } from 'react-router-dom';
import { GroupsCollectionSelect } from '../../addOrEditGroup/groupSettingsForm/groupsCollectionSelect/groupsCollectionSelect.component';
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
	ExcludeObjectsToggleWrapper,
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
import { appendCopySuffixToDuplicateNames } from '../../groupRulesForm/groupRulesForm.helpers';
import { TicketContext } from '../../../../../ticket.context';
import { hexToRgb } from '@/v5/helpers/colors.helper';

type GroupSettingsFormProps = {
	value?: IGroupSettingsForm,
	onSubmit?: (value: IGroupSettingsForm) => void,
	onCancel?: () => void,
	prefixes: string[][],
	isColored?: boolean,
};

const subPrefixes = (path:string[]) => {
	const prefixes: string[][] = [];

	path.forEach((element, index) => {
		for (let i = index; i < path.length; i++) {
			if (index === 0) {
				prefixes.push([element]);
			} else {
				prefixes[i].push(element);
			}
		}
	});

	return prefixes;
};

const mergePrefixes = (prefixesA: string[][], prefixesB: string[][]) => {
	return uniqBy(prefixesA.concat(prefixesB).sort(), JSON.stringify);
};
 
export const GroupSettingsForm = ({ value, onSubmit, onCancel, prefixes, isColored }: GroupSettingsFormProps) => {
	const [isSmart, setIsSmart] = useState(true);
	const [isGroupDefinitionValid, setIsGroupDefinitionValid] = useState(true);
	const [isGroupDefinitionDirty, setIsGroupDefinitionDirty] = useState(false);

	const [newPrefix, setNewPrefix] = useState([]);
	const [currentPrefixes, setCurrentPrefixes] = useState([]);
	const [filterMenuCoords, setFilterMenuCoords] = useState({ left: 0, bottom: 0 });
	const [filterMenuOpen, setFilterMenuOpen] = useState(false);
	const [isPastingRules, setIsPastingRules] = useState(false);
	const [rules, setRules] = useState([]);

	const [selectedRule, setSelectedRule] = useState(null);
	const isAdmin = !TicketsCardHooksSelectors.selectReadOnly();
	const { teamspace, revision } = useParams<ViewerParams>();
	const { containerOrFederation } = useContext(TicketContext);

	const formRef = useRef(null);

	const isNewGroup = !value;
	const selectedNodes = TreeHooksSelectors.selectSelectedNodes();
	const objectsCount = TreeHooksSelectors.selectSelectedObjectsCount();

	const formData = useForm<IGroupSettingsForm>({
		mode: 'all',
		resolver: yupResolver(GroupSettingsSchema),
	});


	const {
		handleSubmit,
		formState: { errors, isValid, touchedFields },
		setValue,
		watch,
	} = formData;
	const excludeDefinedObjects = watch('group.excludeDefinedObjects');

	const getFormIsValid = () => {
		// isDirty from react-hook-form is buggy
		const isDirty = Object.keys(formData.formState.dirtyFields).length > 0;
		return ((isDirty || isGroupDefinitionDirty) && (isValid && isGroupDefinitionValid));
	};

	const onClickSubmit = async (newValues:IGroupSettingsForm) => {
		if (!isSmart) {
			newValues.group.objects = convertToV5GroupNodes(selectedNodes);
		} else if (isGroupDefinitionDirty) {
			const { data } = await getMeshIDsByQuery(teamspace, containerOrFederation, rules, revision);
			newValues.group.objects = meshObjectsToV5GroupNode(data);
			newValues.group.rules = rules;
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
		setNewPrefix(collection);
		setValue('prefix', collection, { shouldDirty: true });
	};

	const handlePasteRules = (pastedRules) => {
		setIsPastingRules(false);
		setRules([...rules, ...appendCopySuffixToDuplicateNames(rules, pastedRules)]);
	};

	const resetFilterMenu = () => {
		setSelectedRule(null);
		setFilterMenuOpen(false);
	};

	const handleAddFilterClick = () => {
		setSelectedRule(null);
		setFilterMenuOpen(true);
	};

	const handleGroupRulesFormSubmit = (data) => {
		if (selectedRule) {
			const newRules = [...rules];
			newRules[selectedRule.index] = data;
			setRules(newRules);
		} else {
			setRules([...rules, data]);
		}
		resetFilterMenu();
	};

	const toggleExcludeDefinedObjects = () => {
		if (!isAdmin) return;
		setValue('group.excludeDefinedObjects', !watch('group.excludeDefinedObjects'), {
			shouldDirty: true,
			shouldValidate: true,
		});
	};

	useEffect(() => {
		// When no value is passed then the group is a new group
		resetFilterMenu();
		if (isNewGroup) {
			formData.reset({
				...(isColored ? { color: hexToRgb(getRandomSuggestedColor()) } : {}),
				opacity: 1,
				prefix: [],
				group: {},
			});
			setIsSmart(true);
			setNewPrefix([]);
			return;
		}

		const newValue = cloneDeep(value);
		if (newValue.group.rules) {
			setRules(newValue.group.rules);
		}

		// objects validation is manage separately, so we remove it from the form data
		delete newValue.group.objects;
		delete newValue.group.rules;
	
		newValue.opacity = newValue.opacity ?? 1;

		formData.reset(newValue);
		setIsSmart(!!value?.group?.rules?.length);
		setIsPastingRules(false);
		setNewPrefix([]);
	}, [value, isColored]);

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

	useEffect(() => {
		setCurrentPrefixes(mergePrefixes(prefixes, subPrefixes(newPrefix)));
	}, [prefixes, newPrefix]);

	useEffect(() => {
		// Validate smart group
		if (!isSmart) return;

		const objectsAreDifferent = !isEqual(
			rules,
			value?.group?.rules,
		);

		setIsGroupDefinitionDirty(objectsAreDifferent);
		setIsGroupDefinitionValid(rules.length > 0);
	}, [isSmart,  rules]);


	useEffect(() => {
		// Validate manual group
		if (isSmart)  return;
	
		const objectsAreDifferent = !isEqual(
			convertToV5GroupNodes(sortBy(selectedNodes)),
			value?.group?.objects,
		);

		setIsGroupDefinitionDirty(objectsAreDifferent);
		setIsGroupDefinitionValid(!!selectedNodes.length);

	}, [isSmart, selectedNodes]);

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
									setValue('color', color, { shouldDirty: true, shouldValidate: true, shouldTouch: true });
									setValue('opacity', opacity, { shouldDirty: true, shouldValidate: true, shouldTouch: true });
								}}
								value={({ color: watch('color'), opacity: watch('opacity') })}
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
							prefixes={currentPrefixes}
						/>
					</FormRow>
					{
						isAdmin && (
							<NewCollectionActionMenu
								TriggerButton={(
									<NewCollectionLink>
										<FormattedMessage
											id="ticketsGroupSettings.link.createCollection"
											defaultMessage="Create new collection"
										/>
									</NewCollectionLink>
								)}
							>
								<NewCollectionForm
									onChange={handleNewCollectionChange}
									prefixesCombinations={currentPrefixes}
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
					<ExcludeObjectsToggleWrapper>
						<Toggle
							value={excludeDefinedObjects}
							onClick={toggleExcludeDefinedObjects}
							disabled={!isAdmin}
						/>
						<ToggleLabel disabled={!isAdmin} onClick={toggleExcludeDefinedObjects}>
							<FormattedMessage
								id="ticketsGroupSettings.form.excludeDefinedObjects"
								defaultMessage="Exclude specified objects"
							/>
						</ToggleLabel>
					</ExcludeObjectsToggleWrapper>
				</FormBox>
				{!isSmart && (
					<Subheading>
						<span>
							<FormattedMessage
								id="ticketsGroupSettings.subHeading.selectedObjects"
								defaultMessage="Selected Objects"
							/>
							<ObjectsCount>{objectsCount}</ObjectsCount>
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
									containerOrFederation={containerOrFederation}
									rule={selectedRule?.value}
									onSubmit={handleGroupRulesFormSubmit}
									onClose={resetFilterMenu}
									existingRules={rules}
								/>
							</Popper>
							<Subheading>
								<FormattedMessage
									id="ticketsGroupSettings.subHeading.filters"
									defaultMessage="Filters"
								/>
								{isAdmin && (
									<AddFilterTitle>
										<TriggerButton onClick={handleAddFilterClick}>
											<FormattedMessage id="tickets.groups.newGroupForm.addFilter" defaultMessage="Add filter" />
										</TriggerButton>
									</AddFilterTitle>
								)}
							</Subheading>
							<FormRulesBox>
								<RulesOptionsMenu value={rules} onPaste={() => setIsPastingRules(true)} onClear={() => { setRules([]); resetFilterMenu(); }} />
								{isPastingRules && (<RulesField onSubmit={handlePasteRules} onClose={() => setIsPastingRules(false)} />)}
								{isPastingRules && rules.length > 0 && (<Gap $height="5px" />)}
								<Rules>
									{rules.map(({ id, ...ruleValue }, i) => (
										<ChipRule
											label={ruleValue.name}
											key={id}
											isSelected={selectedRule === ruleValue}
											onDelete={() => {
												const newRules = [...rules];
												newRules.splice(i, 1);
												setRules(newRules);
												resetFilterMenu();
											}}
											isReadOnly={!isAdmin}
											onClick={() => {
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
