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
import { ITemplate, ITicket, PropertyDefinition, TemplateModule } from '@/v5/store/tickets/tickets.types';
import { filter, get, isEmpty } from 'lodash';
import { useFormContext } from 'react-hook-form';
import { formatMessage } from '@/v5/services/intl';
import PropetiesIcon from '@assets/icons/outlined/bullet_list-outlined.svg';
import { Accordion } from '@controls/accordion/accordion.component';
import { InputController } from '@controls/inputs/inputController.component';
import { CardContent } from '@components/viewer/cards/cardContent.component';
import { getModulePanelTitle } from '@/v5/store/tickets/tickets.helpers';
import { UnsupportedProperty } from './properties/unsupportedProperty.component';
import { TicketProperty } from './properties/properties.helper';
import { BaseTicketInfo, PanelsContainer, ErrorTextGap } from './ticketsForm.styles';
import { TitleProperty } from './properties/titleProperty.component';
import { BaseProperties, IssueProperties } from '../tickets.constants';
import { CreationInfo } from '../../../../components/shared/creationInfo/creationInfo.component';

interface PropertiesListProps {
	properties: PropertyDefinition[];
	propertiesValues: Record<string, any>;
	module: string;
	onPropertyBlur?: (...args) => void;
}

const PropertiesList = ({ module, properties, propertiesValues = {}, onPropertyBlur }: PropertiesListProps) => {
	const { formState } = useFormContext();
	return (
		<>
			{properties.map(({
				name,
				type,
				default: defaultValue,
				readOnly: disabled,
				required,
				values,
			}) => {
				const inputName = `${module}.${name}`;
				const PropertyComponent = TicketProperty[type] || UnsupportedProperty;
				const formError = get(formState.errors, inputName);
				return (
					<>
						<InputController
							Input={PropertyComponent}
							label={name}
							disabled={disabled}
							required={required}
							name={inputName}
							formError={formError}
							defaultValue={propertiesValues[name] ?? defaultValue}
							key={name}
							onBlur={onPropertyBlur}
							values={values}
						/>
						{formError && <ErrorTextGap />}
					</>
				);
			})}
		</>
	);
};

const PropertiesPanel = ({ properties, ...props }: PropertiesListProps) => {
	if (isEmpty(properties)) return <></>;
	return (
		<Accordion
			defaultExpanded
			Icon={PropetiesIcon}
			title={formatMessage({ id: 'customTicket.panel.properties', defaultMessage: 'Properties' })}
		>
			<PropertiesList properties={properties} {...props} />
		</Accordion>
	);
};

interface ModulePanelProps {
	module: TemplateModule;
	moduleValues: Record<string, any>;
}

const ModulePanel = ({ module, moduleValues, ...rest }: ModulePanelProps) => (
	<Accordion {...getModulePanelTitle(module)}>
		<PropertiesList module={`modules.${module.name || module.type}`} properties={module.properties || []} propertiesValues={moduleValues} {...rest} />
	</Accordion>
);

interface Props {
	template: Partial<ITemplate>;
	ticket: Partial<ITicket>;
	onPropertyBlur?: (...args) => void;
	focusOnTitle?: boolean;
}

export const TicketForm = ({ template, ticket, focusOnTitle, onPropertyBlur, ...rest }: Props) => {
	const { formState } = useFormContext();
	const topPanelProperties: string[] = Object.values({ ...BaseProperties, ...IssueProperties });
	const PropertiesPanelProperties = filter(template?.properties, ({ name }) => !topPanelProperties.includes(name));

	return (
		<>
			<BaseTicketInfo>
				<TitleProperty
					name={BaseProperties.TITLE}
					defaultValue={ticket[BaseProperties.TITLE]}
					formError={formState.errors[BaseProperties.TITLE]}
					placeholder={formatMessage({
						id: 'customTicket.newTicket.titlePlaceholder',
						defaultMessage: 'Ticket name',
					})}
					inputProps={{ autoFocus: focusOnTitle }}
					onBlur={onPropertyBlur}
				/>
				<CreationInfo
					owner={ticket.properties?.[BaseProperties.OWNER]}
					createdAt={ticket.properties?.[BaseProperties.CREATED_AT]}
					updatedAt={ticket.properties?.[BaseProperties.UPDATED_AT]}
				/>
			</BaseTicketInfo>
			<CardContent>
				<PanelsContainer>
					<PropertiesPanel
						module="properties"
						properties={PropertiesPanelProperties || []}
						propertiesValues={ticket.properties}
						onPropertyBlur={onPropertyBlur}
						{...rest}
					/>
					{
						(template.modules || []).map((module) => (
							<ModulePanel
								key={module.name || module.type}
								module={module}
								moduleValues={ticket.modules[module.name]}
								{...rest}
							/>
						))
					}
				</PanelsContainer>
			</CardContent>
		</>
	);
};
