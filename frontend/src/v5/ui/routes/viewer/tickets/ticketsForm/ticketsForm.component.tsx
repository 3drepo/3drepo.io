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
import { ITemplate, PropertyDefinition, TemplateModule, EditableTicket, NewTicket } from '@/v5/store/tickets/tickets.types';
import { get } from 'lodash';
import { useFormContext } from 'react-hook-form';
import { formatMessage } from '@/v5/services/intl';
import PropetiesIcon from '@assets/icons/outlined/properties-outlined.svg';
import { Accordion } from '@controls/accordion/accordion.component';
import { CardContent } from '@components/viewer/cards/cardContent.component';
import { UnsupportedProperty } from './properties/unsupportedProperty.component';
import { TicketProperty } from './properties/properties.helper';
import { TitleContainer, FormTitle, PanelsContainer } from './ticketsForm.styles';

interface PropertiesListProps {
	properties: PropertyDefinition[];
	propertiesValues: Record<string, any>;
	module: string;
}

const PropertiesList = ({ module, properties, propertiesValues = {} }: PropertiesListProps) => {
	const { formState } = useFormContext();
	return (
		<>
			{properties.map((property) => {
				const { name, type } = property;
				const inputName = `${module}.${name}`;
				const PropertyComponent = TicketProperty[type] || UnsupportedProperty;
				return (
					<PropertyComponent
						property={property}
						name={inputName}
						formError={get(formState.errors, inputName)}
						defaultValue={property.default ?? propertiesValues[name]}
						key={name}
					/>
				);
			})}
		</>
	);
};

const PropertiesPanel = (props: PropertiesListProps) => (
	<Accordion
		defaultExpanded
		Icon={PropetiesIcon}
		title={formatMessage({ id: 'customTicket.panel.properties', defaultMessage: 'Properties' })}
	>
		<PropertiesList {...props} />
	</Accordion>
);

interface ModulePanelProps {
	module: TemplateModule ;
	moduleValues: Record<string, any>;
}

const ModulePanel = ({ module, moduleValues }: ModulePanelProps) => (
	<Accordion title={module.name} Icon={PropetiesIcon}>
		<PropertiesList module={module.name} properties={module.properties || []} propertiesValues={moduleValues} />
	</Accordion>
);

export const TITLE_INPUT_NAME = 'title';

export const TicketForm = ({ template, ticket } : { template: ITemplate, ticket: EditableTicket | NewTicket }) => {
	const { formState } = useFormContext();
	const TITLE_PLACEHOLDER = formatMessage({
		id: 'customTicket.newTicket.titlePlaceholder',
		defaultMessage: 'Ticket name',
	});
	return (
		<>
			<TitleContainer>
				<FormTitle
					name={TITLE_INPUT_NAME}
					key={ticket.title}
					defaultValue={ticket[TITLE_INPUT_NAME]}
					formError={formState.errors[TITLE_INPUT_NAME]}
					placeholder={TITLE_PLACEHOLDER}
				/>
			</TitleContainer>
			<CardContent>
				<PanelsContainer>
					<PropertiesPanel module="properties" properties={template?.properties || []} propertiesValues={ticket.properties} />
					{
						(template.modules || []).map((module) => (
							<ModulePanel
								key={module.name}
								module={module}
								moduleValues={ticket.modules[module.name]}
							/>
						))
					}
				</PanelsContainer>
			</CardContent>
		</>
	);
};
