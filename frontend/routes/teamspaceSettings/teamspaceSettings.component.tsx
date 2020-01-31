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
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';

import { ROUTES } from '../../constants/routes';
import { schema } from '../../services/validation';
import { Chips } from '../components/chips/chips.component';
import { Loader } from '../components/loader/loader.component';
import { Panel } from '../components/panel/panel.component';
import {
	BackButton,
	ButtonContainer,
	ButtonRowContainer,
	Container,
	Headline,
	LoaderContainer,
	StyledButton,
	StyledForm,
	StyledGrid,
	StyledIcon,
	SuggestionsContainer
} from './teamspaceSettings.styles';

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
	topicTypes?: any[];
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
	fetchTeamspaceSettings: (teamspace) => void;
	updateModelSettings: (modelData, settings) => void;
	modelSettings: any;
	currentTeamspace: string;
	isSettingsLoading: boolean;
}

export class TeamspaceSettings extends React.PureComponent<IProps, IState> {
	public state = {
		topicTypes: [],
		riskCategories: [],
		latitude: 0,
		longitude: 0,
		axisX: 0,
		axisY: 0,
		axisZ: 0,
		elevation: 0,
		angleFromNorth: 0
	};

	public componentDidMount() {
		// const { modelSettings: { properties }, match, fetchModelSettings } = this.props;
		const { match, fetchTeamspaceSettings } = this.props;
		const { teamspace } = match.params;
		// const topicTypes = properties && properties.topicTypes ? properties.topicTypes : [];
		//
		// if (topicTypes.length) {
		// 	this.setState({ topicTypes });
		// }

		fetchTeamspaceSettings(teamspace);
	}

	public componentDidUpdate(prevProps) {
		// const changes = {} as any;
		// const { properties, surveyPoints, elevation, angleFromNorth } = this.props.modelSettings;
		// const prevSurveyPoints = prevProps.modelSettings.surveyPoints;
		// const prevProperties = prevProps.modelSettings.properties;
		// const topicTypes = properties ? properties.topicTypes : [];
		// const prevTopicTypes = prevProperties ? prevProperties.topicTypes : [];
		//
		// if (topicTypes && topicTypes.length !== prevTopicTypes.length) {
		// 	changes.topicTypes = topicTypes;
		// }
		//
		// if (elevation && prevProps.modelSettings.elevation !== elevation) {
		// 	changes.elevation = elevation;
		// }
		//
		// if (angleFromNorth && prevProps.modelSettings.angleFromNorth !== angleFromNorth) {
		// 	changes.angleFromNorth = angleFromNorth;
		// }
		//
		// const pointsChanges = this.getSurveyPointsChanges(prevSurveyPoints, surveyPoints);
		//
		// if (!isEmpty({ ...changes, ...pointsChanges })) {
		// 	this.setState({ ...changes, ...pointsChanges });
		// }
	}

	// public getSurveyPointsChanges = (prevPoints, currentPoints) => {
	// 	const changes = {} as any;
	//
	// 	if (prevPoints !== currentPoints && currentPoints.length) {
	// 		const { axisX, axisY, axisZ, latitude, longitude } = this.state;
	// 		const [prevLatitude, prevLongitude] = currentPoints[0].latLong.map(Number);
	// 		const [prevAxisX, prevAxisY, prevAxisZ] = convertPositionToOpenGL(currentPoints[0].position);
	//
	// 		if (axisX !== prevAxisX) {
	// 			changes.axisX = prevAxisX;
	// 		}
	//
	// 		if (axisY !== prevAxisY) {
	// 			changes.axisY = prevAxisY;
	// 		}
	//
	// 		if (axisZ !== prevAxisZ) {
	// 			changes.axisZ = prevAxisZ;
	// 		}
	//
	// 		if (latitude !== prevLatitude) {
	// 			changes.latitude = prevLatitude;
	// 		}
	//
	// 		if (longitude !== prevLongitude) {
	// 			changes.longitude = prevLongitude;
	// 		}
	// 	}
	// 	return changes;
	// }

	public handleUpdateSettings = (data) => {
		// const { match, location, updateModelSettings } = this.props;
		// const { modelId, teamspace } = match.params;
		// const queryParams = queryString.parse(location.search);
		// const { project } = queryParams;
		// const { name, unit, type, code, elevation, angleFromNorth, fourDSequenceTag,
		// 	topicTypes, axisX, axisY, axisZ, latitude, longitude } = data;
		// const types = topicTypes.map((topicType) => topicType.label);
		//
		// const settings = {
		// 	name,
		// 	unit,
		// 	angleFromNorth,
		// 	code,
		// 	elevation,
		// 	type,
		// 	fourDSequenceTag,
		// 	surveyPoints: [{
		// 		position: convertPositionToDirectX([axisX, axisY, axisZ]),
		// 		latLong: [latitude, longitude].map(Number)
		// 	}],
		// 	topicTypes: types
		// };
		//
		// const modelData = { teamspace, project, modelId };
		// updateModelSettings(modelData, settings);
	}

	public handleBackLink = () => {
		this.props.history.push({ pathname: ROUTES.TEAMSPACES });
	}

	public renderTitleWithBackLink = () => (
		<>
			<BackButton onClick={this.handleBackLink}>
				<StyledIcon />
			</BackButton>
			Teamspace Settings
		</>
	)

	public renderLoader = () => (
		<LoaderContainer>
			<Loader content="Loading teamspace settings data..." />
		</LoaderContainer>
	)

	public renderForm = () => {
		const { id, name, type, fourDSequenceTag, properties, federate } = this.props.modelSettings;
		const { teamspace } = this.props.match.params;
		const {
			latitude, longitude, axisX, axisY, axisZ, angleFromNorth, elevation, topicTypes, riskCategories,
		} = this.state;

		return	(
			<Container>
				<Formik
					initialValues={ {
						id, name, type: federate ? 'Federation' : type, code: properties.code, unit: properties.unit, fourDSequenceTag,
						latitude, longitude, axisX, axisY, axisZ, elevation, angleFromNorth, topicTypes, riskCategories
					} }
					validationSchema={ModelSettingsSchema}
					onSubmit={this.handleUpdateSettings}
				>
					<StyledForm>
						<StyledGrid>
							<Headline color="primary" variant="subheading">Teamspace</Headline>
							<Headline color="textPrimary" variant="subheading">{teamspace}</Headline>
						</StyledGrid>
						<Divider />

						<StyledGrid>
							<Headline color="primary" variant="title">Issues</Headline>
							<Headline color="textPrimary" variant="subheading">Topic Types</Headline>
							<Field name="topicTypes" render={({ field }) => <Chips {...field} inputPlaceholder={'Enter Topic Type'} />} />
						</StyledGrid>
						<Divider />

						<StyledGrid>
							<Headline color="primary" variant="title">Risks</Headline>
							<Headline color="textPrimary" variant="subheading">Categories</Headline>
							<Field name="riskCategories" render={({ field }) => <Chips {...field} inputPlaceholder={'Enter Category'} />} />
						</StyledGrid>

						<SuggestionsContainer container direction="column" wrap="nowrap">
							<Headline color="textPrimary" variant="subheading">Treatment Suggestions</Headline>
							<Grid container direction="column" wrap="nowrap">
								<ButtonRowContainer container direction="row" justify="space-between" alignItems="center" wrap="nowrap">
									<Headline color="textPrimary" variant="body2">No suggestions uploaded</Headline>
									<StyledButton
											color="secondary"
											variant="raised"
											type="button"
											disabled
									>
										Download
									</StyledButton>
								</ButtonRowContainer>
								<ButtonRowContainer container direction="row" justify="space-between" alignItems="center" wrap="nowrap">
									<Headline color="textPrimary" variant="body2">No file selected</Headline>
									<StyledButton
											color="secondary"
											variant="raised"
											type="button"
											disabled
									>
										Browse
									</StyledButton>
								</ButtonRowContainer>
							</Grid>
						</SuggestionsContainer>

						<ButtonContainer container direction="column" alignItems="flex-end">
							<Field render={ ({ form }) =>
								<Button
									type="submit"
									variant="raised"
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
				{isSettingsLoading ? this.renderLoader() : this.renderForm()}
			</Panel>
		);
	}
}
