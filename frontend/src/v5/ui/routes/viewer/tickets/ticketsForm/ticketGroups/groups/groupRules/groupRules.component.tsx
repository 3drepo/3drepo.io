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

import { FormattedMessage } from 'react-intl';
import CrossIcon from '@assets/icons/outlined/close-outlined.svg';
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import { EmptyCardMessage } from '@components/viewer/cards/card.styles';
import { useState } from 'react';
import { IRule, OPERATION_DISPLAY_NAMES } from '../ruleFiltersForm/groupRulesForm.helpers';
import { GroupRulesForm } from '../ruleFiltersForm/groupRulesForm.component';
import { ChipWrapper, EditRuleActionMenu, RuleChip, Rules, NewRuleActionMenu, TriggerButton } from './groupRules';
import { InputController } from '@controls/inputs/inputController.component';

export const GroupRules = () => {
	const [selectedChip, setSelectedChip] = useState<number>(null);

	// TODO - fix type assigend to generic with the actual useForm<T> once the form is valid
	const { control } = useFormContext<{ rules: IRule[] }>();
	const { fields: rules, append, remove, update } = useFieldArray({
		control,
		name: 'rules',
	});

	return (
		<>
			<NewRuleActionMenu
				TriggerButton={(
					<TriggerButton>
						<FormattedMessage id="tickets.groups.addFilter" defaultMessage="Add filter" />
					</TriggerButton>
				)}
			>
				<GroupRulesForm onSave={append} />
			</NewRuleActionMenu>
			<Rules>
				{rules.map((rule, i) => (
					<EditRuleActionMenu
						key={rule.id}
						onOpen={() => setSelectedChip(i)}
						onClose={() => setSelectedChip(null)}
						TriggerButton={(
							<ChipWrapper>
								<RuleChip
									label={(
										<>
											{rule.field} {OPERATION_DISPLAY_NAMES[rule.operation]}
											{!!rule.values?.length && (<b>&nbsp;{rule.values.join()}</b>)}
										</>
									)}
									deleteIcon={<div><CrossIcon /></div>}
									onDelete={() => remove(i)}
									$selected={selectedChip === i}
								/>
							</ChipWrapper>
						)}
					>
						<GroupRulesForm rule={rule} onSave={(updatedFilter) => update(i, updatedFilter)} />
					</EditRuleActionMenu>
				))}
			</Rules>
			{!rules.length && (
				<EmptyCardMessage>
					<FormattedMessage id="tickets.groups.filters.empty" defaultMessage="No filters" />
				</EmptyCardMessage>
			)}
		</>
	);
};

// TODO - delete me, I am here only to create a formContext
export const AddNewGroupForm = () => {
	const defaultRules: IRule[] = [
		{
			field: 'Analytical Properties:Absorptance',
			operation: 'CONTAINS',
			values: ['1', '34'],
		},
		{
			field: 'Absorptance',
			operation: 'EXISTS',
			values: [],
		},
		{
			field: 'Absorptance',
			operation: 'REGEX',
			values: ['/.*{e}+$/'],
		},
	];
	const formData = useForm({ defaultValues: { filters: defaultRules } });

	return (
		<FormProvider {...formData}>
			<InputController
				Input={GroupRules}
			/>
		</FormProvider>
	);
};
