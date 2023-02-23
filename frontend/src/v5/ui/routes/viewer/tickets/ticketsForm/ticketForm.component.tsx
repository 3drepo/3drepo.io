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
import { getModulePanelTitle, PANEL_ID } from '@/v5/store/tickets/tickets.helpers';
import { CardContent, PanelsContainer } from './ticketsForm.styles';
import { TicketsTopPanel } from './ticketsTopPanel/ticketsTopPanel.component';
import { PropertiesList } from './propertiesList.component';
import { CommentsPanel } from '../commentsPanel/commentsPanel.component';

const SCROLLBAR_ID = 'cardScrollbar';
interface ModulePanelProps {
	module: TemplateModule;
	moduleValues: Record<string, any>;
	scrollPanelIntoView: (isExpanding, el) => void;
	defaultExpanded: boolean;
}

const ModulePanel = ({ module, moduleValues, scrollPanelIntoView, defaultExpanded, ...rest }: ModulePanelProps) => (
	<Accordion {...getModulePanelTitle(module)} onChange={scrollPanelIntoView} defaultExpanded={defaultExpanded}>
		<PropertiesList module={`modules.${module.name || module.type}`} properties={module.properties || []} propertiesValues={moduleValues} {...rest} />
	</Accordion>
);

interface Props {
	template: Partial<ITemplate>;
	ticket: Partial<ITicket>;
	onPropertyBlur?: (...args) => void;
	focusOnTitle?: boolean;
}

export const TicketForm = ({ template, ticket, focusOnTitle, ...rest }: Props) => {
	const scrollPanelIntoView = ({ target }, isExpanding) => {
		if (!isExpanding) return;
		const panel = target.closest(`#${PANEL_ID}`);
		if (!panel) return;
		const scrollableContainer = panel.closest(`#${SCROLLBAR_ID}`).firstChild;
		setTimeout(() => {
			scrollableContainer.scrollTo({
				top: panel.offsetTop - 65,
				behavior: 'smooth',
			});
		}, 400);
	};
	return (
		<CardContent id={SCROLLBAR_ID}>
			<TicketsTopPanel
				title={ticket.title}
				properties={template.properties || []}
				propertiesValues={ticket.properties}
				focusOnTitle={focusOnTitle}
				{...rest}
			/>
			<PanelsContainer>
				{
					(template.modules || []).map((module, idx) => (
						<ModulePanel
							key={module.name || module.type}
							module={module}
							moduleValues={ticket.modules[module.name]}
							defaultExpanded={idx === 0}
							scrollPanelIntoView={scrollPanelIntoView}
							{...rest}
						/>
					))
				}
				{template?.config?.comments && (<CommentsPanel scrollPanelIntoView={scrollPanelIntoView} />)}
			</PanelsContainer>
		</CardContent>
	);
};
