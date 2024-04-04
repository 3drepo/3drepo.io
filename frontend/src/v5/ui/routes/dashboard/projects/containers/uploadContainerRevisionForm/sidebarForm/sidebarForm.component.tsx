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

import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { useFormContext } from 'react-hook-form';
import { CONTAINER_TYPES, CONTAINER_UNITS } from '@/v5/store/containers/containers.types';
import * as countriesAndTimezones from 'countries-and-timezones';
import { MenuItem } from '@mui/material';
import { FormSelect, FormTextField } from '@controls/inputs/formInputs.component';
import { get } from 'lodash';
import { LOD_VALUES } from '@/v5/store/containers/revisions/containerRevisions.types';
import { Heading, AnimationsCheckbox, TimezoneSelect, Title, FlexContainer, HiddenMenuItem } from './sidebarForm.styles';
import { extensionIsRevit, extensionIsSpm } from '../extensions.helpers';
import { useContext } from 'react';
import { UploadFilesContext } from '@components/shared/uploadFiles/uploadFilesContext';

const getTimezoneOptions = () => {
	type ITimezone = { name: string; label: string; utcOffset: number; };
	const tzList: ITimezone[] = [];
	const tzData = countriesAndTimezones.getAllTimezones();
	Object.keys(tzData).forEach((tz) => {
		const { name, utcOffset, utcOffsetStr } = tzData[tz];
		const tzToAdd: ITimezone = {
			name,
			label: `(UTC${utcOffsetStr}) ${name}`,
			utcOffset,
		};

		tzList.push(tzToAdd);
	});

	const allTimezones: ITimezone[] = tzList.sort((tz1, tz2) => tz1.utcOffset - tz2.utcOffset);
	return allTimezones || [];
};

export const SidebarForm = () => {
	const { getValues, formState: { errors } } = useFormContext();
	const { fields, selectedId } = useContext(UploadFilesContext);
	// @ts-ignore
	const selectedIndex = fields.findIndex(({ uploadId }) => uploadId === selectedId);
	
	const revisionPrefix = `uploads.${selectedIndex}`;
	const [containerId, extension, containerName] = getValues([`${revisionPrefix}.containerId`, `${revisionPrefix}.extension`, `${revisionPrefix}.containerName`]);

	const isNewEditableContainer = containerName && !containerId;
	const getError = (field: string) => get(errors, `${revisionPrefix}.${field}`);
	return (
		<>
			<Title>
				{containerName}
			</Title>
			<FlexContainer>
				<FormSelect
					required
					disabled={!isNewEditableContainer}
					name={`${revisionPrefix}.containerUnit`}
					label={formatMessage({ id: 'containers.creation.form.units', defaultMessage: 'Units' })}
				>
					{CONTAINER_UNITS.map((unit) => (
						<MenuItem key={unit.value} value={unit.value}>
							{unit.name}
						</MenuItem>
					))}
				</FormSelect>
				<FormSelect
					required
					disabled={!isNewEditableContainer}
					name={`${revisionPrefix}.containerType`}
					label={formatMessage({ id: 'containers.creation.form.type', defaultMessage: 'Category' })}
				>
					{CONTAINER_TYPES.map((type) => (
						<MenuItem key={type.value} value={type.value}>
							{type.name}
						</MenuItem>
					))}
					<HiddenMenuItem key="sample" value="sample">
						<FormattedMessage id="containers.type.sample" defaultMessage="Sample" />
					</HiddenMenuItem>
				</FormSelect>
			</FlexContainer>
			<FormTextField
				name={`${revisionPrefix}.containerCode`}
				label={formatMessage({ id: 'container.uploads.sidebar.containerCode', defaultMessage: 'Container Code' })}
				formError={getError('containerCode')}
				disabled={!isNewEditableContainer}
			/>
			<FormTextField
				name={`${revisionPrefix}.containerDesc`}
				label={formatMessage({ id: 'container.uploads.sidebar.containerDesc', defaultMessage: 'Container Description' })}
				formError={getError('containerDesc')}
				disabled={!isNewEditableContainer}
			/>

			<Heading>
				<FormattedMessage id="container.uploads.sidebar.containerRevisionDetails" defaultMessage="Revision details" />
			</Heading>

			<FormTextField
				name={`${revisionPrefix}.revisionDesc`}
				label={formatMessage({ id: 'container.uploads.sidebar.revisionDesc', defaultMessage: 'Revision Description' })}
				formError={getError('revisionDesc')}
			/>
			{extensionIsRevit(extension) && (
				<FormSelect
					required
					name={`${revisionPrefix}.lod`}
					label={formatMessage({ id: 'container.uploads.sidebar.lod', defaultMessage: 'Level of Detail' })}
				>
					{LOD_VALUES.map((type) => (
						<MenuItem key={type.value} value={type.value}>
							{type.name}
						</MenuItem>
					))}
				</FormSelect>
			)}

			{extensionIsSpm(extension) && (
				<>
					<AnimationsCheckbox
						name={`${revisionPrefix}.importAnimations`}
						label={formatMessage({ id: 'container.uploads.sidebar.importAnimations', defaultMessage: 'Import transformations' })}
					/>
					<TimezoneSelect
						name={`${revisionPrefix}.timezone`}
						label={formatMessage({ id: 'container.uploads.sidebar.timezone', defaultMessage: 'Timezone' })}
					>
						{getTimezoneOptions().map((opt) => (
							<MenuItem key={opt.name} value={opt.name}>
								{opt.label}
							</MenuItem>
						))}
					</TimezoneSelect>
				</>
			)}
		</>
	);
};
