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
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { PropertyDefinition } from '@/v5/store/tickets/tickets.types';

import { CreationInfo } from '@components/shared/creationInfo/creationInfo.component';
import { FormTextAreaFixedSize } from '@controls/inputs/formInputs.component';
import { useFormContext } from 'react-hook-form';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import _ from 'lodash';
import { BaseProperties, IssueProperties } from '../../tickets.constants';
import { TitleProperty } from '../properties/titleProperty.component';
import { PropertiesList } from '../propertiesList.component';
import { IssuePropertiesInputs } from './IssuePropertiesInputs/issuePropertiesInputs.component';
import { BaseTicketInfo, DescriptionProperty, TopPanel } from './ticketsTopPanel.styles';
import { ErrorTextGap } from '../ticketsForm.styles';

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
	const { containerOrFederation } = useParams();
	const readOnly = TicketsCardHooksSelectors.selectReadOnly();
	const ref = useRef<HTMLTextAreaElement>();

	const owner = getValues(`properties.${BaseProperties.OWNER}`);
	const createdAt = getValues(`properties.${BaseProperties.CREATED_AT}`);
	const updatedAt = getValues(`properties.${BaseProperties.UPDATED_AT}`);

	const topPanelProperties: string[] = Object.values({ ...BaseProperties, ...IssueProperties });
	const extraProperties = properties.filter(({ name }) => !topPanelProperties.includes(name));

	useEffect(() => {
		if (!focusOnTitle || !ref.current || !_.isEmpty(formState.touchedFields)) return;
		ref.current.focus();
	}, [containerOrFederation, formState]);

	return (
		<TopPanel>
			<BaseTicketInfo>
				<TitleProperty
					name={BaseProperties.TITLE}
					defaultValue={title}
					formError={formState.errors[BaseProperties.TITLE]}
					onBlur={onPropertyBlur}
					disabled={readOnly}
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
					<FormTextAreaFixedSize
						name={`properties.${BaseProperties.DESCRIPTION}`}
						onBlur={onPropertyBlur}
						placeholder={formatMessage({
							id: 'customTicket.topPanel.description',
							defaultMessage: 'Description',
						})}
						formError={_.get(formState.errors, `properties.${BaseProperties.DESCRIPTION}`)}
						disabled={readOnly}
					/>
					{_.get(formState.errors, `properties.${BaseProperties.DESCRIPTION}`) && <ErrorTextGap />}
				</DescriptionProperty>
				<IssuePropertiesInputs properties={properties} onBlur={onPropertyBlur} readOnly={readOnly} />
				<PropertiesList module="properties" properties={extraProperties} onPropertyBlur={onPropertyBlur} />
			</BaseTicketInfo>
		</TopPanel>
	);
};
