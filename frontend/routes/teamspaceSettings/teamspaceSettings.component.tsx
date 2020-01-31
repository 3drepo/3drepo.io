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
import { isEmpty } from 'lodash';

import { ROUTES } from '../../constants/routes';
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

const PANEL_PROPS = {
	paperProps: {
		height: '100%'
	}
};

interface IState {
	topicTypes?: string[];
	riskCategories?: string[];
}

interface IProps {
	match: any;
	location: any;
	history: any;
	fetchTeamspaceSettings: (teamspace) => void;
	updateTeamspaceSettings: (teamspace, settings) => void;
	teamspaceSettings: any;
	isSettingsLoading: boolean;
}

export class TeamspaceSettings extends React.PureComponent<IProps, IState> {
	public state = {
		topicTypes: [],
		riskCategories: [],
	};

	public componentDidMount() {
		const { match, fetchTeamspaceSettings } = this.props;
		const { teamspace } = match.params;

		fetchTeamspaceSettings(teamspace);
	}

	public componentDidUpdate(prevProps) {
		const changes = {} as any;
		const properties = this.props.teamspaceSettings;
		const prevProperties = prevProps.modelSettingss;
		const topicTypes = properties ? properties.topicTypes : [];
		const prevTopicTypes = prevProperties ? prevProperties.topicTypes : [];
		const riskCategories = properties ? properties.riskCategories : [];
		const prevRiskCategories = prevProperties ? prevProperties.riskCategories : [];

		if (topicTypes && topicTypes.length !== prevTopicTypes.length) {
			changes.topicTypes = topicTypes;
		}

		if (riskCategories && riskCategories.length !== prevRiskCategories.length) {
			changes.riskCategories = riskCategories;
		}
		
		console.warn('changes:', changes);

		if (!isEmpty({ ...changes })) {
			this.setState({ ...changes });
		}
	}

	private handleUpdateSettings = (data) => {
		const { teamspace } = this.props.match.params;
		const { topicTypes, riskCategories } = data;
		const types = topicTypes.map((topicType) => topicType.label);
		const categories = riskCategories.map((riskCategory) => riskCategory.label);
		const settings = {
			topicTypes: types,
			riskCategories: categories,
		};

		this.props.updateTeamspaceSettings(teamspace, settings);
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
		const { teamspace } = this.props.match.params;
		const { topicTypes, riskCategories } = this.state;

		return	(
			<Container>
				<Formik
					initialValues={{
						topicTypes,
						riskCategories
					}}
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
