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

import { formatMessage } from '@/v5/services/intl';
import { TicketsCardHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { PropertyDefinition } from '@/v5/store/tickets/tickets.types';

import { FormTextAreaExpandable } from '@controls/inputs/formInputs.component';
import { useFormContext } from 'react-hook-form';
import { useContext, useEffect, useRef } from 'react';
import _ from 'lodash';
import { BaseProperties, IssueProperties, TicketsCardViews } from '../../tickets.constants';
import { TitleProperty } from '../properties/titleProperty.component';
import { PropertiesList } from '../propertiesList.component';
import { IssuePropertiesInputs } from './issuePropertiesInputs/issuePropertiesInputs.component';
import { DescriptionProperty, TopPanel, CreationInfo, FlexContainer } from './ticketsTopPanel.styles';
import { ErrorTextGap } from '../ticketsForm.styles';
import { StatusProperty } from './statusProperty/statusProperty.component';
import { AssigneesProperty } from './assignessProperty/assigneesProperty.component';
import { TicketContext } from '../../ticket.context';

type ITicketsTopPanel = {
	title: string;
	properties: PropertyDefinition[];
	onPropertyBlur?: (...args) => void;
	focusOnTitle?: boolean;
};

export const TicketsTopPanel = ({
	title,
	properties,
	focusOnTitle,
	onPropertyBlur,
}: ITicketsTopPanel) => {
	const { formState, getValues } = useFormContext();
	const { containerOrFederation } = useContext(TicketContext);

	const templateId = TicketsCardHooksSelectors.selectSelectedTemplateId();
	const isNewTicket = TicketsCardHooksSelectors.selectView() === TicketsCardViews.New;
	const readOnlyDefault = !isNewTicket && !TicketsHooksSelectors.selectHasPermissionForTemplate(containerOrFederation, templateId, 'edit.default');
	const readOnlyStatus = !isNewTicket && !TicketsHooksSelectors.selectHasPermissionForTemplate(containerOrFederation, templateId, 'edit.status');
	const readOnlyAssign = !isNewTicket && !TicketsHooksSelectors.selectHasPermissionForTemplate(containerOrFederation, templateId, 'edit.assignees');

	const ref = useRef<HTMLTextAreaElement>(null);

	const owner = getValues(`properties.${BaseProperties.OWNER}`);
	const createdAt = getValues(`properties.${BaseProperties.CREATED_AT}`);
	const updatedAt = getValues(`properties.${BaseProperties.UPDATED_AT}`);

	const topPanelProperties: string[] = Object.values({ ...BaseProperties, ...IssueProperties });
	const propertiesToInclude = properties.filter(({ name }) => !topPanelProperties.includes(name));
	const hasIssueProperties = properties.some((property) => property.name === IssueProperties.PRIORITY);

	useEffect(() => {
		if (!focusOnTitle || !ref.current || !_.isEmpty(formState.touchedFields)) return;
		ref.current.focus();
	}, [containerOrFederation, formState]);

	return (
		<TopPanel>
			<TitleProperty
				name={BaseProperties.TITLE}
				defaultValue={title}
				formError={formState.errors[BaseProperties.TITLE]}
				onBlur={onPropertyBlur}
				disabled={readOnlyDefault}
				ref={ref}
			/>
			{createdAt && (
				<CreationInfo
					owner={owner}
					createdAt={createdAt}
					updatedAt={updatedAt}
				/>
			)}
			<DescriptionProperty>
				<FormTextAreaExpandable 
					name={`properties.${BaseProperties.DESCRIPTION}`}
					onBlur={onPropertyBlur}
					placeholder={formatMessage({
						id: 'customTicket.topPanel.description',
						defaultMessage: 'Description',
					})}
					formError={_.get(formState.errors, `properties.${BaseProperties.DESCRIPTION}`)}
					disabled={readOnlyDefault}
				/>
				{_.get(formState.errors, `properties.${BaseProperties.DESCRIPTION}`) && <ErrorTextGap />}
			</DescriptionProperty>
			<FlexContainer>
				{hasIssueProperties ? (
					<IssuePropertiesInputs onBlur={onPropertyBlur} readOnly={readOnlyDefault} />
				) : (
					<StatusProperty onBlur={onPropertyBlur} readOnly={readOnlyStatus} />
				)}
			</FlexContainer>
			{hasIssueProperties && (<AssigneesProperty onBlur={onPropertyBlur} readOnly={readOnlyAssign} />)}
			<PropertiesList module="properties" properties={propertiesToInclude} onPropertyBlur={onPropertyBlur} />
		</TopPanel>
	);
};
