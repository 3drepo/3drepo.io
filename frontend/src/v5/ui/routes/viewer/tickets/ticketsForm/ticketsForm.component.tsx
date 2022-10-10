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
import { DashboardListCollapse } from '@components/dashboard/dashboardList';
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
}

const PropertiesPanel = ({ properties, propertiesValues }: PropertiesPanelProps) => (
	<>
		{properties.map((property) => {
			const PropertyComponent = TicketProperty[property.type] || UnsupportedProperty;
			return (<><hr /><PropertyComponent property={property} value={propertiesValues[property.name]} /></>);
		})}
	</>
);

interface ModulePanelProps {
	module: TemplateModule ;
	moduleValues: Record<string, any>;
}

const ModulePanel = ({ module, moduleValues }: ModulePanelProps) => (
	<DashboardListCollapse
		title={<>Module: {module.name}</>}
	>
		<PropertiesPanel properties={module.properties || []} propertiesValues={moduleValues} />
	</DashboardListCollapse>
);

export const TicketForm = ({ template, ticket } : { template: ITemplate, ticket: ITicket }) => (
	<>
		<TextProperty property={{ name: 'title' }} value={ticket.title} />

		<PropertiesPanel properties={template?.properties || []} propertiesValues={ticket.properties} />
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
