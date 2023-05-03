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

import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { PropertyDefinition } from '@/v5/store/tickets/tickets.types';
import { InputController } from '@controls/inputs/inputController.component';
import { get } from 'lodash';
import { Fragment } from 'react';
import { useFormContext } from 'react-hook-form';
import { TicketProperty } from './properties/properties.helper';
import { UnsupportedProperty } from './properties/unsupportedProperty.component';
import { ErrorTextGap, PropertiesListContainer } from './ticketsForm.styles';

interface PropertiesListProps {
	properties: PropertyDefinition[];
	module: string;
	onPropertyBlur?: (...args) => void;
	onGroupsClick?: () => void;
}

export const PropertiesList = ({ module, properties, onPropertyBlur, onGroupsClick }: PropertiesListProps) => {
	const { formState } = useFormContext();
	const isReadOnly = TicketsCardHooksSelectors.selectReadOnly();
	return (
		<PropertiesListContainer>
			{properties.map(({
				name,
				type,
				readOnly: disabled,
				required,
				values,
			}) => {
				const inputName = `${module}.${name}`;
				const PropertyComponent = TicketProperty[type] || UnsupportedProperty;
				const formError = get(formState.errors, inputName);
				return (
					<Fragment key={name}>
						<InputController
							Input={PropertyComponent}
							label={name}
							disabled={disabled || isReadOnly}
							required={required}
							name={inputName}
							formError={formError}
							onBlur={onPropertyBlur}
							// @ts-ignore
							values={values}
							onGroupsClick={onGroupsClick}
						/>
						{formError && <ErrorTextGap />}
					</Fragment>
				);
			})}
		</PropertiesListContainer>
	);
};
