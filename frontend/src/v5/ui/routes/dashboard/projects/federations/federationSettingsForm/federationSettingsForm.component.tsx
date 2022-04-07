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
import { FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers/federationsActions.dispatchers';
import { IFederation, EMPTY_VIEW, FederationSettings } from '@/v5/store/federations/federations.types';
import { FormTextField } from '@controls/formTextField/formTextField.component';
import { FormSelectView } from '@controls/formSelectView/formSelectView.component';
import { FormSelect } from '@controls/formSelect/formSelect.component';
import { FederationSettingsSchema } from '@/v5/validation/schemes';
import { FormattedMessage } from 'react-intl';
import { FlexContainer, SectionTitle, ShareTextField } from './federationSettingsForm.styles';

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

const DECIMAL_UNIT = UNITS[2];

interface IFormInput {
	name: string;
	unit: string;
	desc: string;
	code: string;
	defaultView: string;
	latitude: number;
	longitude: number;
	angleFromNorth: number;
	x: number;
	y: number;
	z: number;
}

const getDefaultValues = (federation: IFederation) => {
	const DEFAULT_UNIT = UNITS[0];
	const {
		unit = DEFAULT_UNIT.abbreviation,
		angleFromNorth = 0,
		code,
		name,
		desc = '',
	} = federation;
	const defaultView = federation.defaultView || EMPTY_VIEW._id;
	const { latLong, position } = federation.surveyPoint || {};
	const [x, y, z] = position || [0, 0, 0];
	const [latitude, longitude] = latLong || [0, 0];
	return {
		name,
		desc,
		code,
		unit,
		defaultView,
		latitude,
		longitude,
		angleFromNorth,
		x,
		y,
		z,
	};
};

type IFederationSettingsForm = {
	open: boolean;
	federation: IFederation;
	onClose: () => void;
};

export const FederationSettingsForm = ({ open, federation, onClose }: IFederationSettingsForm) => {
	let defaultValues = getDefaultValues(federation) as any;
	const {
		handleSubmit,
		reset,
		watch,
		control,
		formState,
		formState: { errors },
	} = useForm<IFormInput>({
		mode: 'onChange',
		resolver: yupResolver(FederationSettingsSchema),
		defaultValues,
	});

	const currentUnit = watch('unit');

	const { teamspace, project } = useParams() as { teamspace: string, project: string };

	const resetValues = () => {
		defaultValues = getDefaultValues(federation) as any;
		reset(defaultValues);
	};

	useEffect(resetValues, [federation]);

	useEffect(() => {
		if (open) {
			FederationsActionsDispatchers.fetchFederationSettings(teamspace, project, federation._id);
			FederationsActionsDispatchers.fetchFederationViews(teamspace, project, federation._id);
			resetValues();
		}
	}, [open]);

	const onSubmit: SubmitHandler<IFormInput> = ({
		latitude, longitude,
		x, y, z,
		...otherSettings
	}) => {
		const settings: FederationSettings = {
			surveyPoint: {
				latLong: [latitude, longitude],
				position: [x, y, z],
			},
			...otherSettings,
		};
		FederationsActionsDispatchers.updateFederationSettings(
			teamspace,
			project,
			federation._id,
			settings,
		);
		onClose();
	};

	return (
		<FormModal
			title={formatMessage({ id: 'federations.settings.title', defaultMessage: 'Federation settings' })}
			open={open}
			onClickClose={onClose}
			onSubmit={handleSubmit(onSubmit)}
			confirmLabel={formatMessage({ id: 'federations.settings.ok', defaultMessage: 'Save Changes' })}
			isValid={formState.isValid}
		>
			<SectionTitle>
				<FormattedMessage
					id="federations.settings.form.informationTitle"
					defaultMessage="Federation information"
				/>
			</SectionTitle>
			<ShareTextField
				label="ID"
				value={federation._id}
			/>
			<FormTextField
				name="name"
				control={control}
				label={formatMessage({ id: 'federations.settings.form.name', defaultMessage: 'Name' })}
				required
				formError={errors.name}
			/>
			<FormTextField
				name="desc"
				control={control}
				label={formatMessage({ id: 'federations.settings.form.desc', defaultMessage: 'Description' })}
				formError={errors.desc}
			/>
			<FlexContainer>
				<FormSelect
					required
					name="unit"
					label={formatMessage({
						id: 'federations.settings.form.unit',
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
					label={formatMessage({ id: 'federation.settings.form.code', defaultMessage: 'Code' })}
					formError={errors.code}
				/>
			</FlexContainer>
			<FormSelectView
				control={control}
				views={[EMPTY_VIEW].concat(federation.views || [])}
				federationId={federation._id}
				name="defaultView"
				label={formatMessage({ id: 'federations.settings.form.defaultView', defaultMessage: 'Default View' })}
			/>
			<SectionTitle>
				<FormattedMessage
					id="federations.settings.form.gisTitle"
					defaultMessage="GIS survey point"
				/>
			</SectionTitle>
			<FlexContainer>
				<FormTextField
					name="latitude"
					control={control}
					label={formatMessage({
						id: 'federations.settings.form.lat',
						defaultMessage: 'Latitude ({unit})',
					}, { unit: DECIMAL_UNIT.name })}
					formError={errors.latitude}
					required
				/>
				<FormTextField
					name="longitude"
					control={control}
					label={formatMessage({
						id: 'federations.settings.form.long',
						defaultMessage: 'Longitude ({unit})',
					}, { unit: DECIMAL_UNIT.name })}
					formError={errors.longitude}
					required
				/>
			</FlexContainer>
			<FormTextField
				name="angleFromNorth"
				control={control}
				label={formatMessage({
					id: 'federations.settings.form.angleFromNorth',
					defaultMessage: 'Angle from North ({unit})',
				}, { unit: 'clockwise degrees' })}
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
