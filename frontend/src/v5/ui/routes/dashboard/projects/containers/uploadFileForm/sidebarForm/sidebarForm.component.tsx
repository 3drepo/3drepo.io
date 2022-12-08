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

import React, { useEffect, useMemo } from 'react';

import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { useForm } from 'react-hook-form';
import { CONTAINER_TYPES, CONTAINER_UNITS, UploadItemFields } from '@/v5/store/containers/containers.types';
import { yupResolver } from '@hookform/resolvers/yup';
import { SidebarSchema } from '@/v5/validation/containerAndFederationSchemes/containerSchemes';
import * as countriesAndTimezones from 'countries-and-timezones';
import { MenuItem } from '@mui/material';
import { FormSelect, FormTextField } from '@controls/inputs/formInputs.component';
import { Heading, AnimationsCheckbox, TimezoneSelect, Title, FlexContainer, HiddenMenuItem } from './sidebarForm.styles';

type ISidebarForm = {
	value: UploadItemFields,
	isNewContainer: boolean;
	isSpm: boolean;
	onChange: (name: string, val: string | boolean) => void;
};

export const SidebarForm = ({
	value,
	onChange,
	isNewContainer,
	isSpm,
}: ISidebarForm): JSX.Element => {
	const { control, formState: { errors }, getValues, setValue, trigger } = useForm<UploadItemFields>({
		defaultValues: value,
		mode: 'onChange',
		resolver: yupResolver(SidebarSchema),
	});

	const TimezoneOptions = useMemo(() => {
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
		return allTimezones;
	}, []);

	useEffect(() => {
		trigger();
	}, []);

	const updateValue = (name) => onChange(name, getValues(name));

	return (
		<div onChange={(e: any) => updateValue(e.target.name)}>
			<Title>
				{value.containerName}
			</Title>
			<FlexContainer>
				<FormSelect
					required
					control={control}
					disabled={!isNewContainer}
					name="containerUnit"
					label={formatMessage({ id: 'containers.creation.form.units', defaultMessage: 'Units' })}
					defaultValue="mm"
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						setValue('containerUnit', e.target.value);
						updateValue('containerUnit');
					}}
				>
					{CONTAINER_UNITS.map((unit) => (
						<MenuItem key={unit.value} value={unit.value}>
							{unit.name}
						</MenuItem>
					))}
				</FormSelect>
				<FormSelect
					required
					control={control}
					disabled={!isNewContainer}
					name="containerType"
					label={formatMessage({ id: 'containers.creation.form.type', defaultMessage: 'Category' })}
					defaultValue="Uncategorised"
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						setValue('containerType', e.target.value);
						updateValue('containerType');
					}}
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
				control={control}
				name="containerCode"
				label={formatMessage({ id: 'uploads.sidebar.containerCode', defaultMessage: 'Container Code' })}
				formError={errors.containerCode}
				disabled={!isNewContainer}
			/>
			<FormTextField
				control={control}
				name="containerDesc"
				label={formatMessage({ id: 'uploads.sidebar.containerDesc', defaultMessage: 'Container Description' })}
				formError={errors.containerDesc}
				disabled={!isNewContainer}
			/>

			<Heading>
				<FormattedMessage id="uploads.sidebar.revisionDetails" defaultMessage="Revision details" />
			</Heading>

			<FormTextField
				control={control}
				name="revisionDesc"
				label={formatMessage({ id: 'uploads.sidebar.revisionDesc', defaultMessage: 'Revision Description' })}
				formError={errors.revisionDesc}
			/>

			{isSpm && (
				<>
					<AnimationsCheckbox
						control={control}
						name="importAnimations"
						label={formatMessage({ id: 'uploads.sidebar.importAnimations', defaultMessage: 'Import transformations' })}
					/>
					<TimezoneSelect
						control={control}
						name="timezone"
						label={formatMessage({ id: 'uploads.sidebar.timezone', defaultMessage: 'Timezone' })}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setValue('timezone', e.target.value);
							updateValue('timezone');
						}}
					>
						{TimezoneOptions.map((opt) => (
							<MenuItem key={opt.name} value={opt.name}>
								{opt.label}
							</MenuItem>
						))}
					</TimezoneSelect>
				</>
			)}
		</div>
	);
};
