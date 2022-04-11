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

import { useEffect } from 'react';
import { formatMessage } from '@/v5/services/intl';
import { yupResolver } from '@hookform/resolvers/yup';
import { MenuItem } from '@mui/material';
import { FormModal } from '@/v5/ui/controls/modal/formModal/formDialog.component';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useParams } from 'react-router';
import { IContainer, ContainerSettings } from '@/v5/store/containers/containers.types';
import { IFederation, FederationSettings } from '@/v5/store/federations/federations.types';
import { EMPTY_VIEW } from '@/v5/store/store.helpers';
import { FormTextField } from '@controls/formTextField/formTextField.component';
import { FormSelectView } from '@controls/formSelectView/formSelectView.component';
import { FormSelect } from '@controls/formSelect/formSelect.component';
import { FormattedMessage } from 'react-intl';
import { FlexContainer, SectionTitle, ShareTextField, Placeholder } from './settingsForm.styles';

const UNITS = [
	{
		name: formatMessage({ id: 'units.mm.name', defaultMessage: 'Millimetres' }),
		abbreviation: formatMessage({ id: 'units.mm.abbreviation', defaultMessage: 'mm' }),
	},
	{
		name: formatMessage({ id: 'units.cm.name', defaultMessage: 'Centimetres' }),
		abbreviation: formatMessage({ id: 'units.cm.abbreviation', defaultMessage: 'cm' }),
	},
	{
		name: formatMessage({ id: 'units.dm.name', defaultMessage: 'Decimetres' }),
		abbreviation: formatMessage({ id: 'units.dm.abbreviation', defaultMessage: 'dm' }),
	},
	{
		name: formatMessage({ id: 'units.m.name', defaultMessage: 'Metres' }),
		abbreviation: formatMessage({ id: 'units.m.abbreviation', defaultMessage: 'm' }),
	},
	{
		name: formatMessage({ id: 'units.ft.name', defaultMessage: 'Feet and inches' }),
		abbreviation: formatMessage({ id: 'units.ft.abbreviation', defaultMessage: 'ft' }),
	},
];

const CATEGORIES = [
	formatMessage({ id: 'category.type.uncategorised', defaultMessage: 'Uncategorised' }),
	formatMessage({ id: 'category.type.architectural', defaultMessage: 'Architectural' }),
	formatMessage({ id: 'category.type.existing', defaultMessage: 'Existing' }),
	formatMessage({ id: 'category.type.gis', defaultMessage: 'GIS' }),
	formatMessage({ id: 'category.type.infrastructure', defaultMessage: 'Infrastructure' }),
	formatMessage({ id: 'category.type.interior', defaultMessage: 'Interior' }),
	formatMessage({ id: 'category.type.landscape', defaultMessage: 'Landscape' }),
	formatMessage({ id: 'category.type.mep', defaultMessage: 'MEP' }),
	formatMessage({ id: 'category.type.mechanical', defaultMessage: 'Mechanical' }),
	formatMessage({ id: 'category.type.structural', defaultMessage: 'Structural' }),
	formatMessage({ id: 'category.type.survey', defaultMessage: 'Survey' }),
	formatMessage({ id: 'category.type.other', defaultMessage: 'Other' }),
];

interface IFormInput {
	name: string;
	unit: string;
	desc: string;
	code: string;
	category?: string,
	defaultView: string;
	latitude: number;
	longitude: number;
	angleFromNorth: number;
	x: number;
	y: number;
	z: number;
}

const getDefaultValues = (containerOrFederation: IContainer | IFederation, isContainer?: boolean) => {
	const DEFAULT_UNIT = UNITS[0];
	const {
		unit = DEFAULT_UNIT.abbreviation,
		angleFromNorth = 0,
		code,
		name,
		desc = '',
	} = containerOrFederation;
	const defaultView = containerOrFederation.defaultView || EMPTY_VIEW._id;
	const { latLong, position } = containerOrFederation.surveyPoint || {};
	const [x, y, z] = position || [0, 0, 0];
	const [latitude, longitude] = latLong || [0, 0];
	return {
		name,
		desc,
		code,
		unit,
		latitude,
		longitude,
		angleFromNorth,
		defaultView,
		x,
		y,
		z,
		...(isContainer ? { category: containerOrFederation.category || 'Uncategorised' } : {}),
	};
};

type ISettingsForm = {
	open: boolean;
	containerOrFederation: IContainer | IFederation;
	settingsSchema: any;
	isContainer?: boolean;
	onClose: () => void;
	fetchSettings: (teamspace: string, project: string, containerOrFederationId: string) => void;
	fetchViews: (teamspace: string, project: string, containerOrFederationId: string) => void;
	updateSettings: (
		teamspace: string,
		project: string,
		containerOrFederationId: string,
		settings: ContainerSettings | FederationSettings,
	) => void;
};

export const SettingsForm = ({
	open,
	containerOrFederation,
	settingsSchema,
	isContainer,
	fetchSettings,
	fetchViews,
	updateSettings,
	onClose,
}: ISettingsForm) => {
	let defaultValues = getDefaultValues(containerOrFederation, isContainer) as any;
	const {
		handleSubmit,
		reset,
		watch,
		control,
		formState,
		formState: { errors },
	} = useForm<IFormInput>({
		mode: 'onChange',
		resolver: yupResolver(settingsSchema),
		defaultValues,
	});

	const currentUnit = watch('unit');

	const { teamspace, project } = useParams() as { teamspace: string, project: string };

	const resetValues = () => {
		defaultValues = getDefaultValues(containerOrFederation, isContainer) as any;
		reset(defaultValues);
	};

	useEffect(resetValues, [containerOrFederation]);

	useEffect(() => {
		if (open) {
			fetchSettings(teamspace, project, containerOrFederation._id);
			fetchViews(teamspace, project, containerOrFederation._id);
			resetValues();
		}
	}, [open]);

	const onSubmit: SubmitHandler<IFormInput> = ({
		latitude, longitude,
		x, y, z,
		...otherSettings
	}) => {
		const settings: ContainerSettings | FederationSettings = {
			surveyPoint: {
				latLong: [latitude, longitude],
				position: [x, y, z],
			},
			...otherSettings,
		};
		updateSettings(
			teamspace,
			project,
			containerOrFederation._id,
			settings,
		);
		onClose();
	};

	const containerOrFederationName = isContainer ? 'Container' : 'Federation';

	return (
		<FormModal
			title={formatMessage({ id: 'settings.title', defaultMessage: `${containerOrFederationName} settings` })}
			open={open}
			onClickClose={onClose}
			onSubmit={handleSubmit(onSubmit)}
			confirmLabel={formatMessage({ id: 'settings.ok', defaultMessage: 'Save Changes' })}
			isValid={formState.isValid}
		>
			<SectionTitle>
				<FormattedMessage
					id="settings.form.informationTitle"
					defaultMessage={`${containerOrFederationName} information`}
				/>
			</SectionTitle>
			<ShareTextField
				label="ID"
				value={containerOrFederation._id}
			/>
			<FormTextField
				name="name"
				control={control}
				label={formatMessage({ id: 'settings.form.name', defaultMessage: 'Name' })}
				required
				formError={errors.name}
			/>
			<FormTextField
				name="desc"
				control={control}
				label={formatMessage({ id: 'settings.form.desc', defaultMessage: 'Description' })}
				formError={errors.desc}
			/>
			<FlexContainer>
				<FormSelect
					required
					name="unit"
					label={formatMessage({
						id: 'settings.form.unit',
						defaultMessage: 'Units',
					})}
					control={control}
					defaultValue={defaultValues.unit}
				>
					{UNITS.map(({ name, abbreviation }) => (
						<MenuItem key={abbreviation} value={abbreviation}>
							{name}
						</MenuItem>
					))}
				</FormSelect>
				<FormTextField
					name="code"
					control={control}
					label={formatMessage({ id: 'settings.form.code', defaultMessage: 'Code' })}
					formError={errors.code}
				/>
			</FlexContainer>
			{isContainer && (
				<FlexContainer>
					<FormSelect
						name="category"
						label={formatMessage({
							id: 'settings.form.category',
							defaultMessage: 'Category',
						})}
						control={control}
						defaultValue={defaultValues.category}
					>
						{CATEGORIES.map((category) => (
							<MenuItem key={category} value={category}>
								{category}
							</MenuItem>
						))}
					</FormSelect>
					<Placeholder />
				</FlexContainer>
			)}
			<FormSelectView
				control={control}
				views={containerOrFederation.views}
				containerOrFederationId={containerOrFederation._id}
				isContainer={isContainer}
				name="defaultView"
				label={formatMessage({ id: 'settings.form.defaultView', defaultMessage: 'Default View' })}
			/>
			<SectionTitle>
				<FormattedMessage
					id="settings.form.gisTitle"
					defaultMessage="GIS survey point"
				/>
			</SectionTitle>
			<FlexContainer>
				<FormTextField
					name="latitude"
					control={control}
					label={formatMessage({ id: 'settings.form.lat', defaultMessage: 'Latitude (decimal)' })}
					formError={errors.latitude}
					required
				/>
				<FormTextField
					name="longitude"
					control={control}
					label={formatMessage({ id: 'settings.form.long', defaultMessage: 'Longitude (decimal)' })}
					formError={errors.longitude}
					required
				/>
			</FlexContainer>
			<FormTextField
				name="angleFromNorth"
				control={control}
				label={formatMessage({ id: 'settings.form.angleFromNorth', defaultMessage: 'Angle from North (clockwise degrees)' })}
				formError={errors.angleFromNorth}
			/>
			<FlexContainer>
				<FormTextField
					name="x"
					control={control}
					label={`x (${currentUnit})`}
					formError={errors.x}
					required
				/>
				<FormTextField
					name="y"
					control={control}
					label={`y (${currentUnit})`}
					formError={errors.y}
					required
				/>
				<FormTextField
					name="z"
					control={control}
					label={`z (${currentUnit})`}
					formError={errors.z}
					required
				/>
			</FlexContainer>
		</FormModal>
	);
};
