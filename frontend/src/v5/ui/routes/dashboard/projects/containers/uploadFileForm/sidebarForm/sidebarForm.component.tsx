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
import { MenuItem } from '@material-ui/core';
import { useForm } from 'react-hook-form';
import { CONTAINER_TYPES, CONTAINER_UNITS, UploadItemFields } from '@/v5/store/containers/containers.types';
import { yupResolver } from '@hookform/resolvers/yup';
import { SidebarSchema } from '@/v5/validation/containers';
import { FormTextField } from '@controls/formTextField/formTextField.component';
import { FormSelect } from '@controls/formSelect/formSelect.component';
import * as countriesAndTimezones from 'countries-and-timezones';
import { Heading, AnimationsCheckbox, TimezoneSelect, Title, FlexContainer } from './sidebarForm.styles';

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
					onChange={
						(e: React.ChangeEvent<HTMLInputElement>) => {
							setValue('containerUnit', e.target.value);
							updateValue('containerUnit');
						}
					}
				>
					{
						CONTAINER_UNITS.map((unit) => (
							<MenuItem key={unit.value} value={unit.value}>
								{unit.name}
							</MenuItem>
						))
					}
				</FormSelect>
				<FormSelect
					required
					control={control}
					disabled={!isNewContainer}
					name="containerType"
					label={formatMessage({ id: 'containers.creation.form.type', defaultMessage: 'Category' })}
					defaultValue="Uncategorised"
					onChange={
						(e: React.ChangeEvent<HTMLInputElement>) => {
							setValue('containerType', e.target.value);
							updateValue('containerType');
						}
					}
				>
					{
						CONTAINER_TYPES.map((type) => (
							<MenuItem key={type.value} value={type.value}>
								{type.name}
							</MenuItem>
						))
					}
					<MenuItem key="sample" value="sample" hidden>
						<FormattedMessage id="containers.type.sample" defaultMessage="Sample" />
					</MenuItem>
				</FormSelect>
			</FlexContainer>
			<FormTextField
				control={control}
				name="containerCode"
				label={formatMessage({ id: 'uploadFileForm.settingsSidebar.containerCode', defaultMessage: 'Container Code' })}
				formError={errors.containerCode}
				disabled={!isNewContainer}
			/>
			<FormTextField
				control={control}
				name="containerDesc"
				label={formatMessage({ id: 'uploadFileForm.settingsSidebar.containerDesc', defaultMessage: 'Container Description' })}
				formError={errors.containerDesc}
				disabled={!isNewContainer}
			/>

			<Heading>
				<FormattedMessage id="uploadFileForm.settingsSidebar.revisionDetails" defaultMessage="Revision details" />
			</Heading>

			<FormTextField
				control={control}
				name="revisionDesc"
				label={formatMessage({ id: 'uploadFileForm.settingsSidebar.revisionDesc', defaultMessage: 'Revision Description' })}
				formError={errors.revisionDesc}
			/>

			<AnimationsCheckbox
				control={control}
				name="importAnimations"
				label={formatMessage({ id: 'uploadFileForm.settingsSidebar.importAnimations', defaultMessage: 'Import transformations' })}
				hidden={!isSpm}
			/>
			<TimezoneSelect
				control={control}
				hidden={!isSpm}
				name="timezone"
				label={formatMessage({ id: 'uploadFileForm.settingsSidebar.timezone', defaultMessage: 'Timezone' })}
				onChange={
					(e: React.ChangeEvent<HTMLInputElement>) => {
						setValue('timezone', e.target.value);
						updateValue('timezone');
					}
				}
			>
				{
					TimezoneOptions.map((opt) => (
						<MenuItem key={opt.name} value={opt.name}>
							{opt.label}
						</MenuItem>
					))
				}
			</TimezoneSelect>
		</div>
	);
};
