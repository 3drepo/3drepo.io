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
import Tooltip from '@material-ui/core/Tooltip';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import EditIcon from '@material-ui/icons/Edit';
import { Field, Formik } from 'formik';
import { isEmpty } from 'lodash';

import { ROUTES } from '../../constants/routes';
import { LONG_DATE_TIME_FORMAT } from '../../services/formatting/formatDate';
import { ChipsInput } from '../components/chipsInput/chipsInput.component';
import { DateTime } from '../components/dateTime/dateTime.component';
import { Loader } from '../components/loader/loader.component';
import { Panel } from '../components/panel/panel.component';
import { FileInputField } from './components/fileInputField/fileInputField.component';
import {
	BackButton,
	ButtonContainer,
	Container,
	DataText,
	FileGrid,
	Headline,
	InfoColumnWrapper,
	LoaderContainer,
	StyledButton,
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

		if (this.props.treatmentsUpdatedAt !== prevProps.treatmentsUpdatedAt && this.state.fileName !== '') {
			this.setState({
				fileName: '',
			});
		}

		if (!isEmpty({ ...changes })) {
			this.setState({ ...changes });
		}
	}

	private handleUpdateSettings = (values, { resetForm }) => {
		const { teamspace } = this.props.match.params;
		const { topicTypes, riskCategories, file } = values;
		const settings = {
			topicTypes,
			riskCategories,
			file,
		};

		this.props.updateTeamspaceSettings(teamspace, settings);
		resetForm({
			topicTypes,
			riskCategories,
		});
		this.setState({
			fileName: '',
		});
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
		const { fileName } = this.state;
		if (fileName) {
			return (
				<Tooltip title={fileName} placement="bottom">
					<span>
						{fileName}
					</span>
				</Tooltip>
			);
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
				<Headline color="textPrimary" variant="subtitle1">Treatment Suggestions</Headline>
				<FileGrid container direction="row" justify="space-between" alignItems="center" wrap="nowrap">
					<InfoColumnWrapper container>
						<DataText variant="body1">
							{this.renderLastTreatmentsUpdated()}
						</DataText>
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
							disabled={!this.treatmentsUpdatedAt}
							onClick={this.handleDownloadTreatments}
						>
							<CloudDownloadIcon />
						</StyledIconButton>
						<StyledButton
							color="primary"
							onClick={this.handleDownloadTreatmentsTemplate}
						>
						Get Template
						</StyledButton>
					</Grid>
				</FileGrid>
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
							<TextField
									value={this.teamspace}
									label="Teamspace"
									margin="dense"
									fullWidth
									disabled
							/>
						</StyledGrid>

						<StyledGrid>
							<Headline>Issue Types</Headline>
							<Field
								name="topicTypes"
								render={({ field }) => <ChipsInput {...field} placeholder={'Enter new issue type...'} />}
							/>
						</StyledGrid>

						<StyledGrid paddingBottom>
							<Headline>Risk Categories</Headline>
							<Field
								name="riskCategories"
								render={({ field }) => <ChipsInput {...field} placeholder="Enter new category..." />}
							/>
						</StyledGrid>

						{this.renderTreatmentSuggestionsSection()}

						<ButtonContainer container direction="column" alignItems="flex-end">
							<Field render={({ form }) =>
								<Button
									type="submit"
									variant="contained"
									color="secondary"
									disabled={!form.isValid || form.isSubmitting}
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
