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
import { getPropertiesInCamelCase } from '@/v5/store/tickets/tickets.helpers';
import { PropertyDefinition } from '@/v5/store/tickets/tickets.types';

import { CreationInfo } from '@components/shared/creationInfo/creationInfo.component';
import { InputController } from '@controls/inputs/inputController.component';
import { TextAreaFixedSize } from '@controls/inputs/textArea/textAreaFixedSize.component';
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
	propertiesValues: Record<string, any>;
	onPropertyBlur?: (...args) => void;
	focusOnTitle?: boolean;
};

export const TicketsTopPanel = ({
	title,
	properties,
	propertiesValues,
	focusOnTitle,
	onPropertyBlur,
}: ITicketsTopPanel) => {
	const {
		owner,
		createdAt,
		updatedAt,
		priority: hasIssueProperties,
	} = getPropertiesInCamelCase(propertiesValues);
	const { formState } = useFormContext();
	const topPanelProperties: string[] = Object.values({ ...BaseProperties, ...IssueProperties });
	const extraProperties = filter(properties, ({ name }) => !topPanelProperties.includes(name));
	return (
		<TopPanel>
			<BaseTicketInfo>
				<TitleProperty
					name={BaseProperties.TITLE}
					defaultValue={title}
					formError={formState.errors[BaseProperties.TITLE]}
					placeholder={formatMessage({
						id: 'customTicket.topPanel.titlePlaceholder',
						defaultMessage: 'Ticket name',
					})}
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
					<InputController
						Input={TextAreaFixedSize}
						name={`properties[${BaseProperties.DESCRIPTION}]`}
						onBlur={onPropertyBlur}
						placeholder={formatMessage({
							id: 'customTicket.topPanel.description',
							defaultMessage: 'Description',
						})}
					/>
				</DescriptionProperty>
				<PropertiesList module="properties" properties={extraProperties} propertiesValues={propertiesValues} onPropertyBlur={onPropertyBlur} />
			</BaseTicketInfo>
			{hasIssueProperties && <IssuePropertiesRow onBlur={onPropertyBlur} />}
		</TopPanel>
	);
};
