/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import * as React from 'react';
import { isEqual, pick, get } from 'lodash';
import AddIcon from '@material-ui/icons/Add';
import * as Yup from 'yup';
import { Formik, Field, Form } from 'formik';

import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import { InputLabel, Grid } from '@material-ui/core';

import { PreviewDetails } from '../../../../../components/previewDetails/previewDetails.component';
import { LogList } from '../../../../../components/logList/logList.component';

import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { prepareRisk } from '../../../../../../helpers/risks';
import { NewCommentForm } from '../../../../../components/newCommentForm/newCommentForm.component';
import { ViewerPanelContent, ViewerPanelFooter, ViewerPanelButton } from '../../../viewerPanel/viewerPanel.styles';
import { CellSelect } from '../../../../../components/customTable/components/cellSelect/cellSelect.component';
import {
	RISK_CATEGORIES,
	RISK_LIKELIHOODS,
	RISK_CONSEQUENCES,
	LEVELS_OF_RISK,
	RISK_MITIGATION_STATUSES
} from '../../../../../../constants/risks';
import { Container } from './riskDetails.styles';

interface IProps {
	jobs: any[];
	risk: any;
}

interface IState {
	risk: any;
	logs: any[];
}

export class RiskDetails extends React.PureComponent<IProps, IState> {
	public state = {
		risk: {} as any,
		logs: []
	};

	get initialFormValues() {
		const { risk } = this.state;
		return {
			...pick(risk, ['safetibase_id', 'associated_activity', 'description', 'mitigation_status']),
			assigned_roles: get(risk, 'assigned_roles[0]', ''),
			name: risk.name || 'Untitled risk',
			likelihood: risk.likelihood || 0,
			consequence: risk.consequence || 0
		};
	}

	public setPreparedRisk = () => {
		const risk = prepareRisk(this.props.risk, this.props.jobs);
		const logs = this.props.risk.comments || [{
			comment: 'Sample comment',
			viewpoint: [],
			created: Date.now(),
			owner: 'charence',
			action: null,
			companyName: 'charence',
			userName: 'charence',
			teamspace: 'charence'
		}];

		this.setState({ risk, logs });
	}

	public componentDidMount() {
		this.setPreparedRisk();
	}

	public componentDidUpdate(prevProps) {
		const riskDataChanged = !isEqual(this.props.risk, prevProps.risk);
		if (riskDataChanged) {
			this.setPreparedRisk();
		}
	}

	public handleRiskSave = () => {

	}

	public handleNewScreenshot = () => {

	}

	public renderRiskOwnerList = () => {

	}

	public renderLogs = renderWhenTrue(() => <LogList items={this.state.logs} />);

	public renderFooter = () => (
		<ViewerPanelFooter alignItems="center" justify="space-between">
			<div>
				<ViewerPanelButton
					aria-label="Take screenshot"
					onClick={this.handleNewScreenshot}
				>Screen</ViewerPanelButton>
				<ViewerPanelButton
					aria-label="Add pin"
					onClick={this.handleNewScreenshot}
				>Pin</ViewerPanelButton>
			</div>
			<ViewerPanelButton
				type="submit"
				aria-label="Add risk"
				onClick={this.handleRiskSave}
				color="secondary"
				variant="fab"
			>
				<AddIcon />
			</ViewerPanelButton>
		</ViewerPanelFooter>
	)

	public render() {
		const { risk, logs } = this.state;

		return (
			<Container>
				<ViewerPanelContent className="height-catcher">
					<PreviewDetails {...risk}>
						<Formik
							initialValues={this.initialFormValues}
							onSubmit={this.handleRiskSave}
						>
							<Form>
									<Grid container alignItems="center" justify="space-between">
										<Field name="safetibase_id" render={({ field }) => (
											<TextField
												{...field}
												label="GUID"
											/>
										)} />

										<Field name="associated_activity" render={({ field }) => (
											<TextField
												{...field}
												label="Asspciated Activity"
											/>
										)} />
									</Grid>

									<Field name="desc" render={({ field }) => (
										<TextField
											{...field}
											fullWidth
											multiline
											label="Description"
										/>
									)} />

									<Grid container alignItems="center" justify="space-between">
										<FormControl>
											<InputLabel shrink={true} htmlFor="assigned_roles">Risk owner</InputLabel>
											<Field name="assigned_roles" render={({ field }) => (
												<CellSelect
													{...field}
													items={this.props.jobs}
													inputId="assigned_roles"
													disabled={false}
												/>
											)} />
										</FormControl>

										<FormControl>
											<InputLabel shrink={true} htmlFor="category">Category</InputLabel>
											<Field name="category" render={({ field }) => (
												<CellSelect
													{...field}
													items={RISK_CATEGORIES}
													inputId="category"
													disabled={false}
												/>
											)} />
										</FormControl>
									</Grid>

									<Grid container alignItems="center" justify="space-between">
										<FormControl>
											<InputLabel shrink={true} htmlFor="likelihood">Risk Likelihood</InputLabel>
											<Field name="likelihood" render={({ field }) => (
												<CellSelect
													{...field}
													items={RISK_LIKELIHOODS}
													inputId="likelihood"
													disabled={false}
												/>
											)} />
										</FormControl>

										<FormControl>
											<InputLabel shrink={true} htmlFor="consequence">Risk Consequence</InputLabel>
											<Field name="consequence" render={({ field }) => (
												<CellSelect
													{...field}
													items={RISK_CONSEQUENCES}
													inputId="consequence"
													disabled={false}
												/>
											)} />
										</FormControl>
									</Grid>

									<Grid container alignItems="center" justify="space-between">
										<FormControl>
											<InputLabel shrink={true} htmlFor="level_of_risk">Level of Risk</InputLabel>
											<Field name="level_of_risk" render={({ field }) => (
												<CellSelect
													{...field}
													items={LEVELS_OF_RISK}
													inputId="level_of_risk"
													disabled={false}
												/>
											)} />
										</FormControl>

										<FormControl>
											<InputLabel shrink={true} htmlFor="mitigation_status">Mitigation Status</InputLabel>
											<Field name="mitigation_status" render={({ field }) => (
												<CellSelect
													{...field}
													items={RISK_MITIGATION_STATUSES}
													inputId="mitigation_status"
													disabled={false}
												/>
											)} />
										</FormControl>
									</Grid>

									<Field name="mitigation_desc" render={({ field }) => (
										<TextField
											{...field}
											fullWidth
											multiline
											label="Mitigation"
										/>
									)} />

							</Form>
						</Formik>
					</PreviewDetails>
				</ViewerPanelContent>
				{this.renderLogs(logs.length)}
				{this.renderFooter()}
			</Container>
		);
	}
}
