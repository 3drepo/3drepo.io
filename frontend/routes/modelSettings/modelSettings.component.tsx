/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import React from 'react';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { Field, Formik } from 'formik';
import { isEmpty } from 'lodash';
import * as queryString from 'query-string';
import * as Yup from 'yup';

import InputLabel from '@material-ui/core/InputLabel';
import { ROUTES } from '../../constants/routes';
import { convertPositionToDirectX, convertPositionToOpenGL, getModelCodeFieldErrorMsg } from '../../helpers/model';
import { IViewpointsComponentState } from '../../modules/viewpoints/viewpoints.redux';
import { clientConfigService } from '../../services/clientConfig';
import { schema } from '../../services/validation';
import { CellSelect } from '../components/customTable/components/cellSelect/cellSelect.component';
import { Loader } from '../components/loader/loader.component';
import { Panel } from '../components/panel/panel.component';
import ViewsDialog from '../components/viewsDialog/viewsDialog.container';
import { DefaultViewField } from './defaultViewField/defaultViewField.component';
import {
	BackButton,
	ButtonContainer,
	Container,
	FieldsRow,
	GridColumn,
	Headline,
	LoaderContainer,
	SelectWrapper,
	StyledCopyableTextField,
	StyledForm,
	StyledIcon,
	StyledTextField,
	SubHeadline,
	ViewContainer,
} from './modelSettings.styles';

const ModelSettingsSchema = Yup.object().shape({
	code: Yup.string()
		.max(50)
		.matches(/^[A-Za-z0-9]+$/),
	longitude: schema.measureNumberDecimal,
	latitude: schema.measureNumberDecimal,
	elevation: schema.measureNumberDecimal,
	angleFromNorth: schema.measureNumberDecimal,
	axisY: schema.measureNumberDecimal,
	axisX: schema.measureNumberDecimal,
	axisZ: schema.measureNumberDecimal
});

const PANEL_PROPS = {
	paperProps: {
		height: '100%'
	}
};

interface IState {
	latitude?: number;
	longitude?: number;
	axisX?: number;
	axisY?: number;
	axisZ?: number;
	elevation?: number;
	angleFromNorth?: number;
	code?: string;
	unit?: string;
}

interface IProps {
	match: any;
	location: any;
	history: any;
	fetchModelSettings: (teamspace, modelId) => void;
	updateModelSettings: (modelData, settings) => void;
	modelSettings: any;
	currentTeamspace: string;
	isSettingsLoading: boolean;
	showDialog: (config) => void;
	setState: (componentState: IViewpointsComponentState) => void;
	searchEnabled?: boolean;
}

export class ModelSettings extends React.PureComponent<IProps, IState> {
	public state = {
		latitude: 0,
		longitude: 0,
		axisX: 0,
		axisY: 0,
		axisZ: 0,
		elevation: 0,
		angleFromNorth: 0
	};

	public componentDidMount() {
		const { match, fetchModelSettings } = this.props;
		const { teamspace, modelId } = match.params;

		fetchModelSettings(teamspace, modelId);
	}

	public componentDidUpdate(prevProps) {
		const changes = {} as any;
		const { surveyPoints, elevation, angleFromNorth, defaultView } = this.props.modelSettings;
		const prevSurveyPoints = prevProps.modelSettings.surveyPoints;

		if (elevation && prevProps.modelSettings.elevation !== elevation) {
			changes.elevation = elevation;
		}

		if (angleFromNorth && prevProps.modelSettings.angleFromNorth !== angleFromNorth) {
			changes.angleFromNorth = angleFromNorth;
		}

		if (defaultView && prevProps.modelSettings.defaultView !== defaultView &&
				prevProps.modelSettings.defaultView && defaultView.id !== prevProps.modelSettings.defaultView.id ) {
			changes.defaultView = defaultView;
		}

		const pointsChanges = this.getSurveyPointsChanges(prevSurveyPoints, surveyPoints);

		if (!isEmpty({ ...changes, ...pointsChanges })) {
			this.setState({ ...changes, ...pointsChanges });
		}
	}

	public getSurveyPointsChanges = (prevPoints, currentPoints) => {
		const changes = {} as any;

		if (prevPoints !== currentPoints && currentPoints.length) {
			const { axisX, axisY, axisZ, latitude, longitude } = this.state;
			const [prevLatitude, prevLongitude] = currentPoints[0].latLong.map(Number);
			const [prevAxisX, prevAxisY, prevAxisZ] = convertPositionToOpenGL(currentPoints[0].position);

			if (axisX !== prevAxisX) {
				changes.axisX = prevAxisX;
			}

			if (axisY !== prevAxisY) {
				changes.axisY = prevAxisY;
			}

			if (axisZ !== prevAxisZ) {
				changes.axisZ = prevAxisZ;
			}

			if (latitude !== prevLatitude) {
				changes.latitude = prevLatitude;
			}

			if (longitude !== prevLongitude) {
				changes.longitude = prevLongitude;
			}
		}
		return changes;
	}

	public handleUpdateSettings = (data) => {
		const { match, location, updateModelSettings } = this.props;
		const { modelId, teamspace } = match.params;
		const queryParams = queryString.parse(location.search);
		const { project } = queryParams;
		const { name, unit, type, code, elevation, angleFromNorth, fourDSequenceTag,
			axisX, axisY, axisZ, latitude, longitude, defaultView } = data;

		const settings = {
			name,
			unit,
			angleFromNorth,
			code,
			elevation,
			type,
			fourDSequenceTag,
			surveyPoints: [{
				position: convertPositionToDirectX([axisX, axisY, axisZ]),
				latLong: [latitude, longitude].map(Number)
			}],
			defaultView: defaultView ? defaultView.id : null,
		};

		const modelData = { teamspace, project, modelId };
		updateModelSettings(modelData, settings);
	}

	public handleBackLink = () => {
		this.props.history.push({ pathname: ROUTES.TEAMSPACES });
	}

	public handleOpenSearchModel = () => this.props.setState({ searchEnabled: true });

	public handleCloseSearchModel = () =>
		this.props.setState({
			searchEnabled: false,
			searchQuery: ''
		})

	public handleSelectView = (onChange) => () => {
		const { match } = this.props;
		const { teamspace, modelId } = match.params;

		this.props.showDialog({
			title: 'Select a View',
			template: ViewsDialog,
			data: {
				teamspace,
				modelId,
				onChange,
			},
			search: {
				enabled: this.props.searchEnabled,
				onOpen: this.handleOpenSearchModel,
				onClose: this.handleCloseSearchModel,
			},
		});
	}

	public renderTitleWithBackLink = () => (
		<>
			<BackButton onClick={this.handleBackLink}>
				<StyledIcon />
			</BackButton>
			Model Settings
		</>
	)

	public renderLoader = (content) => (
		<LoaderContainer>
			<Loader content={content} />
		</LoaderContainer>
	)

	public renderForm = () => {
		const { id, name, type, fourDSequenceTag, properties, federate, defaultView } = this.props.modelSettings;
		const { latitude, longitude, axisX, axisY, axisZ, angleFromNorth, elevation } = this.state;

		return	(
			<Container>
				<Formik
					initialValues={ {
						id, name, type: federate ? 'Federation' : type, code: properties.code, unit: properties.unit, fourDSequenceTag,
						latitude, longitude, axisX, axisY, axisZ, elevation, angleFromNorth, defaultView
					} }
					validationSchema={ModelSettingsSchema}
					onSubmit={this.handleUpdateSettings}
				>
					<StyledForm>
						<Headline color="primary" variant="subtitle1">Model Information</Headline>
						<Grid>
							<FieldsRow container wrap="nowrap">
								<Field name="id" render={ ({ field }) => (
									<StyledCopyableTextField
										{...field}
										label="Model ID"
										margin="normal"
										disabled
									/>
								)} />
								<Field name="name" render={ ({ field, form }) => (
									<StyledTextField
										{...field}
										error={Boolean(form.errors.name)}
										helperText={form.errors.name}
										label="Model name"
										margin="normal"
									/>
								)} />
							</FieldsRow>
							<FieldsRow container wrap="nowrap">
								<Field name="type" render={ ({ field }) => (
									<StyledTextField
										{...field}
										label="Model type"
										margin="normal"
										disabled
									/>
								)} />
								<Field name="code" render={ ({ field, form }) => (
									<StyledTextField
										{...field}
										label="Model code"
										margin="normal"
										error={Boolean(form.errors.code)}
										helperText={getModelCodeFieldErrorMsg(form.errors.code)}
									/>
								)} />
							</FieldsRow>
							<FieldsRow container wrap="nowrap">
								<Field name="fourDSequenceTag" render={ ({ field }) => (
									<StyledTextField
										{...field}
										label="4D Sequence Tag"
										margin="normal"
									/>
								)} />
								<SelectWrapper fullWidth>
									<InputLabel shrink htmlFor="unit-select">Unit</InputLabel>
									<Field name="unit" render={ ({ field }) => (
										<CellSelect
											{...field}
											items={clientConfigService.units}
											inputId="unit-select"
											disabled
										/>
									)} />
								</SelectWrapper>
							</FieldsRow>
						</Grid>
						<ViewContainer container direction="column" wrap="nowrap" alignItems="flex-start">
							<SubHeadline color="textPrimary" variant="subtitle1">Default View</SubHeadline>
							<Field name="defaultView" render={ ({ field }) => (
									<DefaultViewField onSelectView={this.handleSelectView(field.onChange)} {...field} />
							)} />
						</ViewContainer>
						<Headline color="primary" variant="subtitle1">GIS Reference Information</Headline>
						<Grid container direction="column" wrap="nowrap">
							<Grid container direction="row" wrap="nowrap">
								<GridColumn container direction="column" wrap="nowrap">
									<Headline color="textPrimary" variant="subtitle1">Survey Point</Headline>
									<Field name="latitude" render={ ({ field, form }) => (
										<StyledTextField
											{...field}
											label="Latitude (Decimal)"
											margin="normal"
											error={Boolean(form.errors.latitude)}
											helperText={form.errors.latitude}
										/>
									)} />
									<Field name="longitude" render={ ({ field, form }) => (
										<StyledTextField
											{...field}
											label="Longitude"
											margin="normal"
											error={Boolean(form.errors.longitude)}
											helperText={form.errors.longitude}
										/>
									)} />
									<Field name="elevation" render={ ({ field, form }) => (
										<StyledTextField
											{...field}
											label="Elevation"
											margin="normal"
											disabled
											error={Boolean(form.errors.elevation)}
											helperText={form.errors.elevation}
										/>
									)} />
									<Field name="angleFromNorth" render={ ({ field, form }) => (
										<StyledTextField
											{...field}
											label="Angle from North (Clockwise Degrees)"
											margin="normal"
											error={Boolean(form.errors.angleFromNorth)}
											helperText={form.errors.angleFromNorth}
										/>
									)} />
								</GridColumn>
								<GridColumn container direction="column" wrap="nowrap">
									<Headline color="textPrimary" variant="subtitle1">Project Point</Headline>
									<Field name="axisX" render={ ({ field, form }) => (
										<StyledTextField
											{...field}
											label={`x (${properties.unit})`}
											margin="normal"
											error={Boolean(form.errors.axisX)}
											helperText={form.errors.axisX}
										/>
									)} />
									<Field name="axisY" render={ ({ field, form }) => (
										<StyledTextField
											{...field}
											name="axisY"
											label={`y (${properties.unit})`}
											margin="normal"
											error={Boolean(form.errors.axisY)}
											helperText={form.errors.axisY}
										/>
									)} />
									<Field name="axisZ" render={ ({ field, form }) => (
										<StyledTextField
											{...field}
											label={`z (${properties.unit})`}
											margin="normal"
											error={Boolean(form.errors.axisZ)}
											helperText={form.errors.axisZ}
										/>
									)} />
								</GridColumn>
							</Grid>
						</Grid>
						<ButtonContainer container direction="column" alignItems="flex-end">
							<Field render={ ({ form }) =>
								<Button
									type="submit"
									variant="contained"
									color="secondary"
									disabled={!form.isValid || form.isValidating}
								>
									Save
								</Button>}
							/>
						</ButtonContainer>
					</StyledForm>
				</Formik>

			</Container>
		);
	}

	public render() {
		const { isSettingsLoading } = this.props;

		return (
			<Panel {...PANEL_PROPS} title={this.renderTitleWithBackLink()}>
				{isSettingsLoading ? this.renderLoader('Loading model settings data...') : this.renderForm()}
			</Panel>
		);
	}
}
