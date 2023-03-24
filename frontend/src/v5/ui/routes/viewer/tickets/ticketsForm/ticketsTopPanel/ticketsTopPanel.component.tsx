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
import { PropertyDefinition } from '@/v5/store/tickets/tickets.types';

import { CreationInfo } from '@components/shared/creationInfo/creationInfo.component';
import { FormTextAreaFixedSize } from '@controls/inputs/formInputs.component';
import { filter } from 'lodash';
import { useFormContext } from 'react-hook-form';
import { BaseProperties, IssueProperties } from '../../tickets.constants';
import { TitleProperty } from '../properties/titleProperty.component';
import { PropertiesList } from '../propertiesList.component';
import { IssuePropertiesRow } from './IssuePropertiesRow/issuePropertiesRow.component';
import { BaseTicketInfo, DescriptionProperty, TopPanel } from './ticketsTopPanel.styles';

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

	const owner = getValues(`properties.${BaseProperties.OWNER}`);
	const createdAt = getValues(`properties.${BaseProperties.CREATED_AT}`);
	const updatedAt = getValues(`properties.${BaseProperties.UPDATED_AT}`);

	const hasIssueProperties = properties.some((property) => property.name === IssueProperties.PRIORITY);
	const topPanelProperties: string[] = Object.values({ ...BaseProperties, ...IssueProperties });
	const extraProperties = filter(properties, ({ name }) => !topPanelProperties.includes(name));
	return (
		<TopPanel>
			<BaseTicketInfo>
				<TitleProperty
					name={BaseProperties.TITLE}
					defaultValue={title}
					formError={formState.errors[BaseProperties.TITLE]}
					inputProps={{ autoFocus: focusOnTitle }}
					onBlur={onPropertyBlur}
				/>
				{createdAt && (
					<CreationInfo
						owner={owner}
						createdAt={createdAt}
						updatedAt={updatedAt}
					/>
				)}
				<DescriptionProperty>
					<FormTextAreaFixedSize
						name={`properties[${BaseProperties.DESCRIPTION}]`}
						onBlur={onPropertyBlur}
						placeholder={formatMessage({
							id: 'customTicket.topPanel.description',
							defaultMessage: 'Description',
						})}
					/>
				</DescriptionProperty>
				<PropertiesList module="properties" properties={extraProperties} onPropertyBlur={onPropertyBlur} />
			</BaseTicketInfo>
			{hasIssueProperties && <IssuePropertiesRow onBlur={onPropertyBlur} />}
		</TopPanel>
	);
};
