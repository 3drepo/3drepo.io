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
import { get } from 'lodash';
import { useFormContext } from 'react-hook-form';
import { formatMessage } from '@/v5/services/intl';
import PropetiesIcon from '@assets/icons/outlined/bullet_list-outlined.svg';
import { Accordion } from '@controls/accordion/accordion.component';
import { InputController } from '@controls/inputs/inputController.component';
import { CardContent } from '@components/viewer/cards/cardContent.component';
import { TITLE_INPUT_NAME, getModulePanelTitle } from '@/v5/store/tickets/tickets.helpers';
import { UnsupportedProperty } from './properties/unsupportedProperty.component';
import { TicketProperty } from './properties/properties.helper';
import { TitleContainer, PanelsContainer, ErrorTextGap } from './ticketsForm.styles';
import { TitleProperty } from './properties/titleProperty.component';
import { CommentsPanel } from './commentsPanel/commentsPanel.component';

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
							// @ts-ignore
							values={values}
						/>
						{formError && <ErrorTextGap />}
					</>
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
	module: TemplateModule;
	moduleValues: Record<string, any>;
	scrollPanelIntoView: (event, isExpanding) => void;
}

const ModulePanel = ({ module, moduleValues, scrollPanelIntoView, ...rest }: ModulePanelProps) => (
	<Accordion {...getModulePanelTitle(module)} onChange={scrollPanelIntoView}>
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
	const { formState } = useFormContext();

	const scrollPanelIntoView = ({ target }, isExpanding) => {
		if (!isExpanding) return;
		const panel = target.parentNode.parentNode;
		const scrollableContainer = panel.parentNode.parentNode.parentNode;
		setTimeout(() => {
			scrollableContainer.scrollTo({
				top: panel.offsetTop - 15,
				behavior: 'smooth',
			});
		}, 400);
	};

	return (
		<>
			<TitleContainer>
				<TitleProperty
					name={TITLE_INPUT_NAME}
					defaultValue={ticket[TITLE_INPUT_NAME]}
					formError={formState.errors[TITLE_INPUT_NAME]}
					placeholder={formatMessage({
						id: 'customTicket.newTicket.titlePlaceholder',
						defaultMessage: 'Ticket name',
					})}
					inputProps={{ autoFocus: focusOnTitle }}
					onBlur={rest?.onPropertyBlur}
				/>
			</TitleContainer>
			<CardContent>
				<PanelsContainer>
					<PropertiesPanel module="properties" properties={template?.properties || []} propertiesValues={ticket.properties} {...rest} />
					{
						(template.modules || []).map((module) => (
							<ModulePanel
								key={module.name || module.type}
								module={module}
								moduleValues={ticket.modules[module.name]}
								scrollPanelIntoView={scrollPanelIntoView}
								{...rest}
							/>
						))
					}
					{template?.config?.comments && (<CommentsPanel scrollPanelIntoView={scrollPanelIntoView} />)}
				</PanelsContainer>
			</CardContent>
		</>
	);
};
