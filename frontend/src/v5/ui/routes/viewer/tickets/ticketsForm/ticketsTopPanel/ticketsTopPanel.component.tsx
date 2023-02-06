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
import { ITicket } from '@/v5/store/tickets/tickets.types';

import { CreationInfo } from '@components/shared/creationInfo/creationInfo.component';
import { InputController } from '@controls/inputs/inputController.component';
import { TextAreaFixedSize } from '@controls/inputs/textArea/textAreaFixedSize.component';
import { BaseProperties, IssueProperties } from '../../tickets.constants';
import { TitleProperty } from '../properties/titleProperty.component';
import { IssuePropertiesBar } from './issuePropertiesBar/issuePropertiesBar.component';
import { BaseTicketInfo, DescriptionProperty, TopPanel } from './ticketsTopPanel.styles';

type ITicketsTopPanel = {
	ticket: Partial<ITicket>;
	onPropertyBlur?: (...args) => void;
	focusOnTitle?: boolean;
	formState: any;
};

export const TicketsTopPanel = ({ ticket, formState, focusOnTitle, onPropertyBlur }: ITicketsTopPanel) => (
	<TopPanel>
		<BaseTicketInfo>
			<TitleProperty
				name={BaseProperties.TITLE}
				defaultValue={ticket[BaseProperties.TITLE]}
				formError={formState.errors[BaseProperties.TITLE]}
				placeholder={formatMessage({
					id: 'customTicket.topPanel.titlePlaceholder',
					defaultMessage: 'Ticket name',
				})}
				inputProps={{ autoFocus: focusOnTitle }}
				onBlur={onPropertyBlur}
			/>
			<CreationInfo
				owner={ticket.properties?.[BaseProperties.OWNER]}
				createdAt={ticket.properties?.[BaseProperties.CREATED_AT]}
				updatedAt={ticket.properties?.[BaseProperties.UPDATED_AT]}
			/>
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
		</BaseTicketInfo>
		{ticket.properties[IssueProperties.PRIORITY] && (
			<IssuePropertiesBar
				priority={ticket.properties[IssueProperties.PRIORITY]}
				dueDate={ticket.properties[IssueProperties.DUE_DATE]}
				status={ticket.properties[IssueProperties.STATUS]}
				assignees={ticket.properties[IssueProperties.ASSIGNEES]}
				onBlur={onPropertyBlur}
			/>
		)}
	</TopPanel>
);
