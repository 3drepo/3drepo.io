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
import { ITemplate, ITicket, TemplateModule } from '@/v5/store/tickets/tickets.types';
import { Accordion } from '@controls/accordion/accordion.component';
import { getModulePanelTitle } from '@/v5/store/tickets/tickets.helpers';
import { CardContent, PanelsContainer } from './ticketsForm.styles';
import { TicketsTopPanel } from './ticketsTopPanel/ticketsTopPanel.component';
import { PropertiesList } from './propertiesList.component';

interface ModulePanelProps {
	module: TemplateModule;
	moduleValues: Record<string, any>;
	defaultExpanded: boolean;
}

const ModulePanel = ({ module, moduleValues, defaultExpanded, ...rest }: ModulePanelProps) => (
	<Accordion {...getModulePanelTitle(module)} defaultExpanded={defaultExpanded}>
		<PropertiesList module={`modules.${module.name || module.type}`} properties={module.properties || []} propertiesValues={moduleValues} {...rest} />
	</Accordion>
);

interface Props {
	template: Partial<ITemplate>;
	ticket: Partial<ITicket>;
	onPropertyBlur?: (...args) => void;
	focusOnTitle?: boolean;
}

export const TicketForm = ({ template, ticket, ...rest }: Props) => (
	<CardContent>
		<TicketsTopPanel title={ticket.title} properties={template.properties || []} propertiesValues={ticket.properties} {...rest} />
		<PanelsContainer>
			{
				(template.modules || []).map((module, idx) => (
					<ModulePanel
						key={module.name || module.type}
						module={module}
						moduleValues={ticket.modules[module.name]}
						defaultExpanded={idx === 0}
						{...rest}
					/>
				))
			}
		</PanelsContainer>
	</CardContent>
);
