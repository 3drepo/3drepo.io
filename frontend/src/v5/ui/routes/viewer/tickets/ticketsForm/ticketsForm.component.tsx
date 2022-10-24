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
import { EditableTicket, ITemplate, PropertyDefinition, TemplateModule } from '@/v5/store/tickets/tickets.types';
import { DashboardListCollapse } from '@components/dashboard/dashboardList';
import { get } from 'lodash';
import { useFormContext } from 'react-hook-form';
import { CoordsProperty } from './properties/coordsProperty.component';
import { DateProperty } from './properties/dateProperty.component';
import { ImageProperty } from './properties/imageProperty.component';
import { LongTextProperty } from './properties/longTextProperty.component';
import { ManyOfProperty } from './properties/manyOfProperty.component';
import { NumberProperty } from './properties/numberProperty.component';
import { OneOfProperty } from './properties/oneOfProperty.component';
import { TextProperty } from './properties/textProperty.component';
import { UnsupportedProperty } from './properties/unsupportedProperty.component';

const TicketProperty = {
	text: TextProperty,
	longText: LongTextProperty,
	date: DateProperty,
	oneOf: OneOfProperty,
	manyOf: ManyOfProperty,
	coords: CoordsProperty,
	number: NumberProperty,
	image: ImageProperty,
};

interface PropertiesPanelProps {
	properties: PropertyDefinition[] ;
	propertiesValues: Record<string, any>;
	module: string;
}

const PropertiesPanel = ({ module, properties, propertiesValues = {} }: PropertiesPanelProps) => {
	const { formState  } = useFormContext();
	return (
		<>
			{properties.map((property) => {
				const { name } = property;
				const inputName = `${module}.${name}`;
				const PropertyComponent = TicketProperty[property.type] || UnsupportedProperty;
				return (
					<PropertyComponent
						property={property}
						defaultValue={propertiesValues[name]}
						name={inputName}
						formError={get(formState.errors, inputName)}
					/>
				);
			})}
		</>
	);
};

interface ModulePanelProps {
	module: TemplateModule ;
	moduleValues: Record<string, any>;
}

const ModulePanel = ({ module, moduleValues }: ModulePanelProps) => (
	<DashboardListCollapse title={<>Module: {module.name}</>}>
		<PropertiesPanel module={module.name} properties={module.properties || []} propertiesValues={moduleValues} />
	</DashboardListCollapse>
);

export const TicketForm = ({ template, ticket } : { template: ITemplate, ticket: EditableTicket }) => {
	const { formState } = useFormContext();
	const TITLE_INPUT_NAME = 'title';
	return (
		<>
			<TextProperty
				name={TITLE_INPUT_NAME}
				property={{ name: TITLE_INPUT_NAME }}
				defaultValue={ticket[TITLE_INPUT_NAME]}
				formError={formState.errors[TITLE_INPUT_NAME]}
			/>

			<PropertiesPanel module="properties" properties={template?.properties || []} propertiesValues={ticket.properties} />
			{
				(template.modules || []).map((module) => (
					<>
						<br />
						<ModulePanel
							module={module}
							moduleValues={ticket.modules[module.name]}
						/>
					</>
				))
			}
		</>
	);
};
