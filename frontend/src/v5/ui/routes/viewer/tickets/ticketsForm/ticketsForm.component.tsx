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
import { formatMessage } from '@/v5/services/intl';
import PropetiesIcon from '@assets/icons/outlined/properties-outlined.svg';
import { Accordion } from '@controls/accordion/accordion.component';
import { CardContent } from '@components/viewer/cards/cardContent.component';
import { CoordsProperty } from './properties/coordsProperty.component';
import { DateProperty } from './properties/dateProperty.component';
import { ImageProperty } from './properties/imageProperty.component';
import { LongTextProperty } from './properties/longTextProperty.component';
import { ManyOfProperty } from './properties/manyOfProperty.component';
import { NumberProperty } from './properties/numberProperty.component';
import { OneOfProperty } from './properties/oneOfProperty.component';
import { TextProperty } from './properties/textProperty.component';
import { UnsupportedProperty } from './properties/unsupportedProperty.component';
import { FormTitle, PanelsContainer } from './ticketsForm.styles';

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

interface PropertiesListProps {
	properties: PropertyDefinition[] ;
	propertiesValues: Record<string, any>;
}

const PropertiesList = ({ properties, propertiesValues = {} }: PropertiesListProps) => (
	<>
		{properties.map((property) => {
			const PropertyComponent = TicketProperty[property.type] || UnsupportedProperty;
			return (
				<PropertyComponent
					property={property}
					value={propertiesValues[property.name]}
					key={property.name}
				/>
			);
		})}
	</>
);

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
		<PropertiesList properties={module.properties || []} propertiesValues={moduleValues} />
	</Accordion>
);

export const TicketForm = ({ template, ticket } : { template: ITemplate, ticket: ITicket }) => (
	<>
		<FormTitle name="title" defaultValue={ticket.title} />
		<CardContent>
			<PanelsContainer>
				<PropertiesPanel properties={template?.properties || []} propertiesValues={ticket.properties} />
				{
					(template.modules || []).map((module) => (
						<ModulePanel
							module={module}
							moduleValues={ticket.modules[module.name]}
						/>
					))
				}
			</PanelsContainer>
		</CardContent>
	</>
);
