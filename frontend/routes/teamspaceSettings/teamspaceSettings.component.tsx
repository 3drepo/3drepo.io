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
import TextField from '@material-ui/core/TextField';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import EditIcon from '@material-ui/icons/Edit';
import { Field, Formik } from 'formik';
import { isEmpty } from 'lodash';

import { ROUTES } from '../../constants/routes';
import { LONG_DATE_TIME_FORMAT } from '../../services/formatting/formatDate';
import { Chips } from '../components/chips/chips.component';
import { DateTime } from '../components/dateTime/dateTime.component';
import { Loader } from '../components/loader/loader.component';
import { Panel } from '../components/panel/panel.component';
import { FileInputField } from './components/fileInputField/fileInputField.component';
import {
	BackButton,
	ButtonContainer,
	Container,
	Headline,
	InfoColumnWrapper,
	LoaderContainer,
	StyledForm,
	StyledGrid,
	StyledIcon,
	StyledIconButton,
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
	fileName: string;
}

interface IProps {
	match: any;
	location: any;
	history: any;
	fetchTeamspaceSettings: (teamspace) => void;
	updateTeamspaceSettings: (teamspace, settings) => void;
	downloadTreatmentsTemplate: () => void;
	downloadTreatments: (teamspace) => void;
	teamspaceSettings: any;
	isSettingsLoading: boolean;
	treatmentsUpdatedAt: any;
}

export class TeamspaceSettings extends React.PureComponent<IProps, IState> {
	public state = {
		topicTypes: [],
		riskCategories: [],
		fileName: '',
	};

	get teamspace() {
		return this.props.match.params.teamspace;
	}

	get treatmentsUpdatedAt() {
		return this.props.treatmentsUpdatedAt || false;
	}

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

		if (!isEmpty({ ...changes })) {
			this.setState({ ...changes });
		}
	}

	private handleUpdateSettings = (values) => {
		const { teamspace } = this.props.match.params;
		const { topicTypes, riskCategories, file } = values;
		const types = topicTypes.map((topicType) => topicType.label);
		const categories = riskCategories.map((riskCategory) => riskCategory.label);
		const settings = {
			topicTypes: types,
			riskCategories: categories,
			file,
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

	public handleFileChange = (onChange) => (event, ...params) => {
		this.setState({
			fileName: event.target.value.name
		});

		onChange(event, ...params);
	}

	private handleDownloadTreatmentsTemplate = () => {
		this.props.downloadTreatmentsTemplate();
	}

	private handleDownloadTreatments = () => {
		this.props.downloadTreatments(this.teamspace);
	}

	private renderLastTreatmentsUpdated = () => {
		if (this.state.fileName) {
			return this.state.fileName;
		}

		if (this.treatmentsUpdatedAt) {
			return (
				<>
					Last updated:&nbsp;
					<DateTime value={this.treatmentsUpdatedAt} format={LONG_DATE_TIME_FORMAT} />
				</>
			);
		}
		return 'No suggestions uploaded';
	}

	private renderTreatmentSuggestionsSection = () => {
		return (
			<SuggestionsContainer container direction="column" wrap="nowrap">
				<Headline color="textPrimary" variant="subheading">Risk Treatment Suggestions</Headline>
				<Grid container direction="row" justify="space-between" alignItems="center" wrap="nowrap">
					<InfoColumnWrapper container>
						<Headline color="textPrimary" variant="body1">{this.renderLastTreatmentsUpdated()}</Headline>
					</InfoColumnWrapper>
					<Grid container alignItems="center" wrap="nowrap">
						<Field name="file" render={({ field }) =>
							<FileInputField
								{...field}
								renderButton={() => (
									<StyledIconButton component="span" aria-label="Upload treatments">
										<EditIcon />
									</StyledIconButton>
								)}
								onChange={this.handleFileChange(field.onChange)}
							/>}
						/>
						<StyledIconButton
							aria-label="Download treatments"
							onClick={this.handleDownloadTreatments}
						>
							<CloudDownloadIcon />
						</StyledIconButton>
					</Grid>
				</Grid>
			</SuggestionsContainer>
		);
	}

	public renderForm = () => {
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
							<Headline color="textPrimary" variant="subheading">Teamspace</Headline>
							<TextField
									value={this.teamspace}
									margin="dense"
									fullWidth
									disabled
							/>
						</StyledGrid>

						<StyledGrid>
							<Headline color="textPrimary" variant="subheading">Issues Types</Headline>
							<Field name="topicTypes" render={({ field }) => <Chips {...field} inputPlaceholder={'Enter Topic Type'} />} />
						</StyledGrid>

						<StyledGrid>
							<Headline color="textPrimary" variant="subheading">Risk Categories</Headline>
							<Field name="riskCategories" render={({ field }) => <Chips {...field} inputPlaceholder={'Enter Category'} />} />
						</StyledGrid>

						{this.renderTreatmentSuggestionsSection()}

						<ButtonContainer container direction="column" alignItems="flex-end">
							<Field render={ ({ form }) =>
								<Button
									type="submit"
									variant="raised"
									color="secondary"
									disabled={!form.dirty}
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
