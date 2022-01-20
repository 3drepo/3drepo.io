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

import React, { useEffect, useState } from 'react';
import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { TextField, MenuItem, InputLabel, FormControl } from '@material-ui/core';
import { Select } from '@controls/select';
import { FormModal } from '@/v5/ui/controls/modal/formModal/formDialog.component';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useParams } from 'react-router';
import { FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers/federationsActions.dispatchers';
import { IFederation } from '@/v5/store/federations/federations.types';
import { FlexContainer, SectionTitle } from './federationSettingsForm.styles';

interface IFormInput {
	name: string;
	unit: string;
	desc: string;
	code: string;
	view: string;
	lat: number;
	long: number;
	angle: number;
	x: number;
	y: number;
	z: number;
}

const FederationSchema = Yup.object().shape({
	name: Yup.string()
		.min(2,
			formatMessage({
				id: 'federations.settings.name.error.min',
				defaultMessage: 'Federation Name must be at least 2 characters',
			}))
		.max(120,
			formatMessage({
				id: 'federations.settings.name.error.max',
				defaultMessage: 'Federation Name is limited to 120 characters',
			}))
		.required(
			formatMessage({
				id: 'federations.settings.name.error.required',
				defaultMessage: 'Federation Name is a required field',
			}),
		),
	desc: Yup.string()
		.max(600,
			formatMessage({
				id: 'federations.settings.description.error.max',
				defaultMessage: 'Container Description is limited to 600 characters',
			})).default('Uncategorised'),
	unit: Yup.string().required().default('mm'),
	code: Yup.string()
		.max(50,
			formatMessage({
				id: 'federations.settings.code.error.max',
				defaultMessage: 'Code is limited to 50 characters',
			}))
		.matches(/^[A-Za-z0-9]*$/,
			formatMessage({
				id: 'federations.settings.code.error.characters',
				defaultMessage: 'Code can only consist of letters and numbers',
			})),
	view: Yup.string().default('None'),
	lat: Yup.number()
		.min(-90,
			formatMessage({
				id: 'federations.settings.latitude.error.min',
				defaultMessage: 'Latitude cannot be smaller than -90',
			}))
		.max(90,
			formatMessage({
				id: 'federations.settings.latitude.error.max',
				defaultMessage: 'Latitude cannot be greater than 90',
			})),
	long: Yup.number()
		.min(-180,
			formatMessage({
				id: 'federations.settings.longitude.error.min',
				defaultMessage: 'Longitude cannot be smaller than -180',
			}))
		.max(180,
			formatMessage({
				id: 'federations.settings.longitude.error.max',
				defaultMessage: 'Longitude cannot be greater than 180',
			})),
	angle: Yup.number()
		.min(-180,
			formatMessage({
				id: 'federations.settings.angle.error.min',
				defaultMessage: 'Angle cannot be smaller than -180',
			}))
		.max(180,
			formatMessage({
				id: 'federations.settings.angle.error.max',
				defaultMessage: 'Angle cannot be greater than 180',
			})),
	x: Yup.number(),
	y: Yup.number(),
	z: Yup.number(),
});

type IFederationSettingsForm = {
	open: boolean;
	federation: IFederation;
	onClose: () => void;
};

export const FederationSettingsForm = ({ open, federation, onClose }: IFederationSettingsForm) => {
	const {
		register,
		handleSubmit,
		reset,
		formState,
		formState: { errors },
	} = useForm<IFormInput>({
		mode: 'onChange',
		resolver: yupResolver(FederationSchema),
	});
	const { teamspace, project } = useParams() as { teamspace: string, project: string };

	const [currentUnit, setCurrentUnit] = useState('mm');

	const onSubmit: SubmitHandler<IFormInput> = (body) => {
		// FederationsActionsDispatchers.editFederation(teamspace, project, body);
		onClose();
	};

	useEffect(reset, [!open]);

	return (
		<FormModal
			title={formatMessage({ id: 'federations.settings.title', defaultMessage: 'Federation settings' })}
			open={open}
			onClickClose={onClose}
			onSubmit={handleSubmit(onSubmit)}
			confirmLabel={formatMessage({ id: 'federations.settings.ok', defaultMessage: 'Save Changes' })}
			isValid={formState.isValid}
		>
			<SectionTitle>Federation information</SectionTitle>
			{/* <ShareTextField
				label="ID"
				text={federation._id}
			/> */}
			<TextField
				label={formatMessage({ id: 'federations.settings.form.name', defaultMessage: 'Name' })}
				required
				error={!!errors.name}
				helperText={errors.name?.message}
				{...register('name')}
			>
				{federation.name}
			</TextField>
			<TextField
				label={formatMessage({ id: 'federations.settings.form.description', defaultMessage: 'Description' })}
				{...register('desc')}
			>
				{federation.description}
			</TextField>
			<FlexContainer>
				<FormControl>
					<InputLabel id="unit-label" required>
						<FormattedMessage id="federations.settings.form.unit" defaultMessage="Units" />
					</InputLabel>
					<Select
						labelId="unit-label"
						defaultValue="mm"
						onClick={(e) => setCurrentUnit((e.target as HTMLSelectElement).value)}
						{...register('unit')}
					>
						<MenuItem value="mm">
							<FormattedMessage id="federations.settings.form.unit.mm" defaultMessage="Millimetres" />
						</MenuItem>
						<MenuItem value="cm">
							<FormattedMessage id="federations.settings.form.unit.cm" defaultMessage="Centimetres" />
						</MenuItem>
						<MenuItem value="dm">
							<FormattedMessage id="federations.settings.form.unit.dm" defaultMessage="Decimetres" />
						</MenuItem>
						<MenuItem value="m">
							<FormattedMessage id="federations.settings.form.unit.m" defaultMessage="Metres" />
						</MenuItem>
						<MenuItem value="ft">
							<FormattedMessage id="federations.settings.form.unit.ft" defaultMessage="Feet and inches" />
						</MenuItem>
					</Select>
				</FormControl>
				<TextField
					label={formatMessage({ id: 'federation.settings.form.code', defaultMessage: 'Code' })}
					error={!!errors.code}
					helperText={errors.code?.message}
					{...register('code')}
				/>
			</FlexContainer>
			<FormControl>
				<InputLabel id="view-label">
					<FormattedMessage id="federations.settings.form.view" defaultMessage="Default View" />
				</InputLabel>
				<Select
					labelId="view-label"
					defaultValue="None"
					{...register('view')}
				>
					<MenuItem value="None">
						<FormattedMessage id="federations.settings.form.unit.none" defaultMessage="None" />
					</MenuItem>
					<MenuItem value="Front">
						<FormattedMessage id="federations.settings.form.unit.front" defaultMessage="Front" />
					</MenuItem>
					<MenuItem value="Left">
						<FormattedMessage id="federations.settings.form.unit.left" defaultMessage="Left" />
					</MenuItem>
					<MenuItem value="Right">
						<FormattedMessage id="federations.settings.form.unit.right" defaultMessage="Right" />
					</MenuItem>
					<MenuItem value="Back">
						<FormattedMessage id="federations.settings.form.unit.back" defaultMessage="Back" />
					</MenuItem>
					<MenuItem value="Top">
						<FormattedMessage id="federations.settings.form.unit.top" defaultMessage="Top" />
					</MenuItem>
					<MenuItem value="Bottom">
						<FormattedMessage id="federations.settings.form.unit.bottom" defaultMessage="Bottom" />
					</MenuItem>
				</Select>
			</FormControl>
			<SectionTitle>GIS servey point</SectionTitle>
			<FlexContainer>
				<TextField
					label={formatMessage({ id: 'federations.settings.form.lat', defaultMessage: 'LATITUTE (decimal)' })}
					type="number"
					{...register('lat')}
				>
					{federation.lat}
				</TextField>
				<TextField
					label={formatMessage({ id: 'federations.settings.form.long', defaultMessage: 'LONGITUDE (decimal)' })}
					type="number"
					{...register('long')}
				>
					{federation.long}
				</TextField>
			</FlexContainer>
			<TextField
				label={formatMessage({ id: 'federations.settings.form.angle', defaultMessage: 'ANGLE FROM NORTH (clockwise degrees)' })}
				type="number"
				{...register('angle')}
			>
				{federation.angle}
			</TextField>
			<FlexContainer>
				<TextField
					label={formatMessage({ id: 'federations.settings.form.x', defaultMessage: `X (${currentUnit})` })}
					type="number"
					{...register('x')}
				>
					{federation.x}
				</TextField>
				<TextField
					label={formatMessage({ id: 'federations.settings.form.y', defaultMessage: `Y (${currentUnit})` })}
					type="number"
					{...register('y')}
				>
					{federation.y}
				</TextField>
				<TextField
					label={formatMessage({ id: 'federations.settings.form.z', defaultMessage: `Z (${currentUnit})` })}
					type="number"
					{...register('z')}
				>
					{federation.z}
				</TextField>
			</FlexContainer>
		</FormModal>
	);
};
