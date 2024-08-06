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

import { ActionMenuItem } from '@controls/actionMenu';
import { FormattedMessage } from 'react-intl';
import { useEffect } from 'react';
import { Button } from '@controls/button';
import { useForm, FormProvider } from 'react-hook-form';
import { SubmitButton } from '@controls/submitButton';
import { FormTextField } from '@controls/inputs/formInputs.component';
import { formatMessage } from '@/v5/services/intl';
import { InputController } from '@controls/inputs/inputController.component';
import { yupResolver } from '@hookform/resolvers/yup';
import { NewCollectionSchema } from '@/v5/validation/groupSchemes/groupSchemes';
import { Buttons, Form } from './newCollectionForm.styles';
import { GroupsCollectionSelect } from '../../addOrEditGroup/groupSettingsForm/groupsCollectionSelect/groupsCollectionSelect.component';

type NewCollectionFormProps = {
	value?: string[];
	onChange?: (value: string[]) => void;
	prefixesCombinations: string[][]
};
export const NewCollectionForm = ({ onChange, value = [], prefixesCombinations }: NewCollectionFormProps) => {
	const formData = useForm<{ collection: string, parent: string[] }>({
		defaultValues: {
			collection: value.slice(-1)[0] || '',
			parent: value.slice(0, -1),
		},
		mode: 'all',
		resolver: yupResolver(NewCollectionSchema),
		context: { prefixesCombinations },
	});

	const { formState: { isValid, errors, isDirty, dirtyFields }, trigger } = formData;

	const onSubmit = (e) => {
		e.preventDefault();
		e.stopPropagation();
		formData.handleSubmit(({ parent, collection }) => onChange(parent.concat(collection)))(e);
	};

	useEffect(() => {
		if (dirtyFields.collection) {
			trigger('collection');
		}
	}, [formData.watch('parent')]);

	return (
		<Form onSubmit={onSubmit}>
			<FormProvider {...formData}>
				<InputController
					Input={GroupsCollectionSelect}
					name="parent"
					label={formatMessage({
						id: 'ticketsGroupSettings.form.newCollection',
						defaultMessage: 'Parent collection (optional)',
					})}
					prefixes={prefixesCombinations}
				/>
				<FormTextField
					name="collection"
					label={formatMessage({
						id: 'ticketsGroupSettings.form.newCollection',
						defaultMessage: 'Collection title',
					})}
					required
					formError={errors.collection}
				/>
				<Buttons>
					<ActionMenuItem>
						<Button variant="text" color="secondary">
							<FormattedMessage id="tickets.groups.filterPanel.cancel" defaultMessage="Cancel" />
						</Button>
					</ActionMenuItem>
					<ActionMenuItem disabled={!isValid || !isDirty}>
						<SubmitButton
							variant="contained"
							color="primary"
							fullWidth={false}
							disabled={!isValid || !isDirty}
						>
							{value.length ? (
								<FormattedMessage id="tickets.groups.newCollectionPanel.updateNewCollection" defaultMessage="Update Collection" />
							) : (
								<FormattedMessage id="tickets.groups.newCollectionPanel.createNewCollection" defaultMessage="Create Collection" />
							)}
						</SubmitButton>
					</ActionMenuItem>
				</Buttons>
			</FormProvider>
		</Form>
	);
};
