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

import { useEffect, useState } from 'react';
import { defaults, pick, omitBy, difference, isMatch, mapValues, isNumber } from 'lodash';
import { formatMessage } from '@/v5/services/intl';
import { yupResolver } from '@hookform/resolvers/yup';
import { MenuItem } from '@mui/material';
import { FormModal } from '@controls/formModal/formModal.component';
import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { IContainer, ContainerSettings } from '@/v5/store/containers/containers.types';
import { IFederation, FederationSettings } from '@/v5/store/federations/federations.types';
import { EMPTY_VIEW } from '@/v5/store/store.helpers';
import { ShareTextField } from '@controls/shareTextField';
import { FormattedMessage } from 'react-intl';
import { nameAlreadyExists } from '@/v5/validation/errors.helpers';
import { UnhandledErrorInterceptor } from '@controls/errorMessage/unhandledErrorInterceptor/unhandledErrorInterceptor.component';
import { FormNumberField, FormSelect, FormSelectView, FormTextField } from '@controls/inputs/formInputs.component';
import { ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { FlexContainer, SectionTitle, Placeholder, HiddenMenuItem } from './settingsModal.styles';
import { MODEL_UNITS } from '../models.helpers';

const CONTAINER_TYPES = [
	formatMessage({ id: 'settings.type.uncategorised', defaultMessage: 'Uncategorised' }),
	formatMessage({ id: 'settings.type.architectural', defaultMessage: 'Architectural' }),
	formatMessage({ id: 'settings.type.existing', defaultMessage: 'Existing' }),
	formatMessage({ id: 'settings.type.gis', defaultMessage: 'GIS' }),
	formatMessage({ id: 'settings.type.infrastructure', defaultMessage: 'Infrastructure' }),
	formatMessage({ id: 'settings.type.interior', defaultMessage: 'Interior' }),
	formatMessage({ id: 'settings.type.landscape', defaultMessage: 'Landscape' }),
	formatMessage({ id: 'settings.type.mep', defaultMessage: 'MEP' }),
	formatMessage({ id: 'settings.type.mechanical', defaultMessage: 'Mechanical' }),
	formatMessage({ id: 'settings.type.structural', defaultMessage: 'Structural' }),
	formatMessage({ id: 'settings.type.survey', defaultMessage: 'Survey' }),
	formatMessage({ id: 'settings.type.other', defaultMessage: 'Other' }),
];

interface IFormInput {
	name: string;
	unit: string;
	desc: string;
	code: string;
	category?: string,
	type?: string,
	defaultView: string;
	latitude: number;
	longitude: number;
	angleFromNorth: number;
	x: number;
	y: number;
	z: number;
}

const getDefaultValues = (containerOrFederation: IContainer | IFederation, isContainer?: boolean) => {
	const DEFAULT_UNIT = MODEL_UNITS[0];
	const {
		unit = DEFAULT_UNIT.abbreviation,
		angleFromNorth,
		code,
		name,
		desc = '',
	} = containerOrFederation;
	const defaultView = containerOrFederation.defaultView || EMPTY_VIEW._id;
	const { latLong, position } = containerOrFederation.surveyPoint || {};
	const [x, y, z] = position ?? [undefined, undefined, undefined];
	const [latitude, longitude] = latLong ?? [undefined, undefined];
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
		...(isContainer ? { type: (containerOrFederation as IContainer).type || 'Uncategorised' } : {}),
	};
};

type ISettingsModal = {
	open: boolean;
	containerOrFederation: IContainer | IFederation;
	settingsSchema: any;
	isContainer?: boolean;
	onClickClose: () => void;
	fetchSettings: (teamspace: string, project: string, containerOrFederationId: string) => void;
	fetchViews: (teamspace: string, project: string, containerOrFederationId: string) => void;
	updateSettings: (
		teamspace: string,
		project: string,
		containerOrFederationId: string,
		settings: ContainerSettings | FederationSettings,
		onSuccess: () => void,
		onError: (error) => void,
	) => void;
};

export const SettingsModal = ({
	open,
	containerOrFederation,
	settingsSchema,
	isContainer,
	fetchSettings,
	fetchViews,
	updateSettings,
	onClickClose,
}: ISettingsModal) => {
	const [alreadyExistingNames, setAlreadyExistingNames] = useState([]);
	const [isValid, setIsValid] = useState(false);
	const DEFAULT_VALUES = getDefaultValues(containerOrFederation, isContainer) as any;
	const {
		handleSubmit,
		reset,
		getValues,
		watch,
		trigger,
		control,
		formState,
		formState: { errors, dirtyFields },
	} = useForm<IFormInput>({
		mode: 'onChange',
		resolver: yupResolver(settingsSchema),
		defaultValues: DEFAULT_VALUES,
		context: { alreadyExistingNames },
	});

	const currentUnit = useWatch({ control, name: 'unit' });
	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();

	const containerOrFederationName = isContainer ? 'Container' : 'Federation';
	const EMPTY_GIS_VALUES = { latitude: undefined, longitude: undefined, angleFromNorth: undefined };

	const getGisValues = (obj) => defaults(pick(
		omitBy(obj, (val) => val === ''),
		Object.keys(EMPTY_GIS_VALUES),
	), EMPTY_GIS_VALUES);

	const fieldsHaveChanged = () => {
		const gisKeys = Object.keys(EMPTY_GIS_VALUES);

		// no field has changed
		if (Object.keys(dirtyFields).length === 0) return false;

		// fields other than the gis values changed
		if (difference(Object.keys(dirtyFields), gisKeys).length > 0) return true;

		// check whether gis values are different
		return !isMatch(mapValues(getGisValues(getValues()), Number), getGisValues(DEFAULT_VALUES));
	};

	const onSubmitError = (err) => {
		if (nameAlreadyExists(err)) {
			setAlreadyExistingNames([getValues('name'), ...alreadyExistingNames]);
			trigger('name');
		}
	};

	const onSubmit: SubmitHandler<IFormInput> = ({
		latitude, longitude, angleFromNorth,
		x, y, z,
		code,
		...rest
	}) => {
		const settings = { ...rest, angleFromNorth, code } as ContainerSettings | FederationSettings;
		if (isNumber(latitude)) {
			settings.surveyPoint = {
				latLong: [latitude, longitude],
				position: [x, y, z],
			};
		}
		updateSettings(
			teamspace,
			project,
			containerOrFederation._id,
			settings,
			onClickClose,
			onSubmitError,
		);
	};

	useEffect(() => {
		fetchSettings(teamspace, project, containerOrFederation._id);
		fetchViews(teamspace, project, containerOrFederation._id);
	}, []);

	useEffect(() => {
		reset(getDefaultValues(containerOrFederation, isContainer));
	}, [containerOrFederation]);

	useEffect(() => { setIsValid(formState.isValid && fieldsHaveChanged()); }, [watch()]);

	return (
		<FormModal
			open={open}
			title={formatMessage({ id: 'settings.title', defaultMessage: `${containerOrFederationName} settings` })}
			onClickClose={onClickClose}
			onSubmit={handleSubmit(onSubmit)}
			confirmLabel={formatMessage({ id: 'settings.ok', defaultMessage: 'Save Changes' })}
			isValid={isValid}
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
				disabled={!isProjectAdmin}
			/>
			<FormTextField
				name="desc"
				control={control}
				label={formatMessage({ id: 'settings.form.desc', defaultMessage: 'Description' })}
				formError={errors.desc}
				disabled={!isProjectAdmin}
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
					disabled={!isProjectAdmin}
				>
					{MODEL_UNITS.map(({ name, abbreviation }) => (
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
					disabled={!isProjectAdmin}
				/>
			</FlexContainer>
			{isContainer && (
				<FlexContainer>
					<FormSelect
						name="type"
						label={formatMessage({
							id: 'settings.form.category',
							defaultMessage: 'Category',
						})}
						control={control}
						disabled={!isProjectAdmin}
					>
						{CONTAINER_TYPES.map((type) => (
							<MenuItem key={type} value={type}>
								{type}
							</MenuItem>
						))}
						<HiddenMenuItem key="sample" value="sample">
							<FormattedMessage id="settings.type.sample" defaultMessage="Sample" />
						</HiddenMenuItem>
					</FormSelect>
					<Placeholder />
				</FlexContainer>
			)}
			<FormSelectView
				control={control}
				name="defaultView"
				label={formatMessage({ id: 'settings.form.defaultView', defaultMessage: 'Home View' })}
				views={containerOrFederation.views}
				containerOrFederationId={containerOrFederation._id}
				isContainer={isContainer}
				disabled={!isProjectAdmin}
			/>
			<SectionTitle>
				<FormattedMessage
					id="settings.form.gisTitle"
					defaultMessage="GIS survey point"
				/>
			</SectionTitle>
			<FlexContainer>
				<FormNumberField
					name="latitude"
					control={control}
					label={formatMessage({ id: 'settings.form.lat', defaultMessage: 'Latitude (decimal)' })}
					formError={errors.latitude}
					disabled={!isProjectAdmin}
				/>
				<FormNumberField
					name="longitude"
					control={control}
					label={formatMessage({ id: 'settings.form.long', defaultMessage: 'Longitude (decimal)' })}
					formError={errors.longitude}
					disabled={!isProjectAdmin}
				/>
			</FlexContainer>
			<FormNumberField
				name="angleFromNorth"
				control={control}
				label={formatMessage({ id: 'settings.form.angleFromNorth', defaultMessage: 'Angle from North (clockwise degrees)' })}
				formError={errors.angleFromNorth}
				disabled={!isProjectAdmin}
			/>
			<FlexContainer>
				<FormNumberField
					name="x"
					control={control}
					label={`x (${currentUnit})`}
					formError={errors.x}
					disabled={!isProjectAdmin}
				/>
				<FormNumberField
					name="y"
					control={control}
					label={`y (${currentUnit})`}
					formError={errors.y}
					disabled={!isProjectAdmin}
				/>
				<FormNumberField
					name="z"
					control={control}
					label={`z (${currentUnit})`}
					formError={errors.z}
					disabled={!isProjectAdmin}
				/>
			</FlexContainer>
			<UnhandledErrorInterceptor expectedErrorValidators={[nameAlreadyExists]} />
		</FormModal>
	);
};
