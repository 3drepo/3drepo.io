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

import { FormProvider, useForm, useFieldArray } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { EmptyCardMessage } from '@components/viewer/cards/card.styles';
import { Typography } from '@controls/typography';
import { SubmitButton } from '@controls/submitButton';
import { Form, InputsSection, NewRuleActionMenu, SectionTitle, TriggerButton, Rules } from './newGroupForm.styles';
import { ChipRule } from './chipRule/chipRule.component';
import { IRule } from '../groupRulesForm/groupRulesForm.helpers';
import { GroupRulesForm } from '../groupRulesForm/groupRulesForm.component';

export const NewGroupForm = () => {
	const formData = useForm<{ rules: IRule[] }>({
		defaultValues: { rules: [{ field: 'Area', operation: 'CONTAINS', values: [2, 67] }] },
	});

	const { fields: rules, append, remove, update } = useFieldArray({
		control: formData.control,
		name: 'rules',
	});

	const onSubmit = (body) => {
		console.log(body);
	};

	return (
		<Form onSubmit={formData.handleSubmit(onSubmit)}>
			<FormProvider {...formData}>
				<Typography variant='h3'>
					<FormattedMessage id="tickets.groups.newGroupForm.addNewGroup" defaultMessage="Add new group" />
				</Typography>
				<SectionTitle>
					<Typography variant='h5'>
						<FormattedMessage id="tickets.groups.newGroupForm.filters" defaultMessage="Filters" />
					</Typography>
					<NewRuleActionMenu
						TriggerButton={(
							<TriggerButton>
								<FormattedMessage id="tickets.groups.newGroupForm.addFilter" defaultMessage="Add filter" />
							</TriggerButton>
						)}
					>
						<GroupRulesForm onSave={append} />
					</NewRuleActionMenu>
				</SectionTitle>
				<InputsSection>
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
				</InputsSection>
				<SubmitButton>Submit (log values in console)</SubmitButton>
			</FormProvider>
		</Form>
	);
};
