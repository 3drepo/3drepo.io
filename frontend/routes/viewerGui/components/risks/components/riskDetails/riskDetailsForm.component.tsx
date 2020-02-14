/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Tooltip from '@material-ui/core/Tooltip';
import { withFormik, Form } from 'formik';
import { debounce, get, isEmpty, isEqual } from 'lodash';
import * as Yup from 'yup';

import {
	ATTACHMENTS_RISK_TYPE, MAIN_RISK_TYPE, RISK_TABS, TREATMENT_RISK_TYPE,
} from '../../../../../../constants/risks';
import { VIEWER_PANELS_TITLES } from '../../../../../../constants/viewerGui';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { calculateLevelOfRisk } from '../../../../../../helpers/risks';
import { canChangeAssigned, canChangeBasicProperty, canChangeStatus } from '../../../../../../helpers/risks';
import { VALIDATIONS_MESSAGES } from '../../../../../../services/validation';
import PinButton from '../../../pinButton/pinButton.container';
import { AttachmentsFormTab } from '../attachmentsFormTab/attachmentsFormTab.component';
import { MainRiskFormTab } from '../mainRiskFormTab/mainRiskFormTab.component';
import { TreatmentRiskFormTab } from '../treatmentFormTab/treatmentFormTab.component';
import {
	Container,
	DescriptionImage,
	FieldsContainer,
	FieldsRow,
	StyledFormControl,
	TabContent,
} from './riskDetails.styles';

interface IProps {
	risk: any;
	jobs: any[];
	formik: any;
	values: any;
	associatedActivities: any[];
	permissions: any;
	currentUser: any;
	myJob: any;
	isValid: boolean;
	dirty: boolean;
	onSubmit: (values) => void;
	onValueChange: (event) => void;
	handleChange: (event) => void;
	handleSubmit: () => void;
	onSavePin: (position) => void;
	onChangePin: (pin) => void;
	setFieldValue: (fieldName, fieldValue) => void;
	onRemoveResource: (resource) => void;
	attachFileResources: () => void;
	attachLinkResources: () => void;
	showDialog: (config: any) => void;
	canComment: boolean;
	hasPin: boolean;
	hidePin?: boolean;
	criteria: any;
	showMitigationSuggestions: (conditions: any, setFieldValue) => void;
}

interface IState {
	isSaving: boolean;
	activeTab: string;
}

export const RiskSchema = Yup.object().shape({
	description: Yup.string().max(220, VALIDATIONS_MESSAGES.TOO_LONG_STRING),
	mitigation_desc: Yup.string().max(220, VALIDATIONS_MESSAGES.TOO_LONG_STRING),
	residual_risk: Yup.string().max(220, VALIDATIONS_MESSAGES.TOO_LONG_STRING)
});

class RiskDetailsFormComponent extends React.PureComponent<IProps, IState> {
	get isNewRisk() {
		return !this.props.risk._id;
	}

	get canEditRiskStatus() {
		const { risk, myJob, permissions, currentUser } = this.props;
		return this.isNewRisk || canChangeStatus(risk, myJob, permissions, currentUser);
	}

	get canEditBasicProperty() {
		const { risk, myJob, permissions, currentUser } = this.props;
		return this.isNewRisk || canChangeBasicProperty(risk, myJob, permissions, currentUser);
	}

	get canChangeAssigned() {
		const { risk, myJob, permissions, currentUser } = this.props;
		return canChangeAssigned(risk, myJob, permissions, currentUser);
	}

	public state = {
		isSaving: false,
		activeTab: MAIN_RISK_TYPE,
	};

	public autoSave = debounce(() => {
		const { onSubmit, isValid, values } = this.props;

		if (!isValid) {
			return;
		}

		this.setState({ isSaving: true }, () => {
			onSubmit(values);
			this.setState({ isSaving: false });
		});
	}, 200);

	public componentDidUpdate(prevProps) {
		const changes = {} as IState;
		const { values, dirty } = this.props;
		const valuesChanged = !isEqual(prevProps.values, values);

		if (dirty) {
			if (valuesChanged && !this.state.isSaving) {
				const likelihoodChanged = prevProps.values.likelihood !== values.likelihood;
				const consequenceChanged = prevProps.values.consequence !== values.consequence;

				if (likelihoodChanged || consequenceChanged) {
					this.updateRiskLevel('likelihood', 'consequence', 'level_of_risk');
				}

				const residualLikelihoodChanged = prevProps.values.residual_likelihood !== values.residual_likelihood;
				const residualConsequenceChanged = prevProps.values.residual_consequence !== values.residual_consequence;

				if (residualLikelihoodChanged || residualConsequenceChanged) {
					this.updateRiskLevel('residual_likelihood', 'residual_consequence', 'residual_level_of_risk');
				}

				this.autoSave();
			}

			if (valuesChanged && this.state.isSaving) {
				changes.isSaving = false;
			}
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public updateRiskLevel = (likelihoodPath, consequencePath, riskLevelPath) => {
		const { values, setFieldValue } = this.props;
		const levelsOfRisk = {
			level_of_risk: values.level_of_risk,
			residual_level_of_risk: values.residual_level_of_risk
		};
		levelsOfRisk[riskLevelPath] = calculateLevelOfRisk(values[likelihoodPath], values[consequencePath]);
		setFieldValue(riskLevelPath, levelsOfRisk[riskLevelPath]);
		if (0 <= levelsOfRisk.residual_level_of_risk) {
			setFieldValue('overall_level_of_risk', levelsOfRisk.residual_level_of_risk);
		} else {
			setFieldValue('overall_level_of_risk', levelsOfRisk.level_of_risk);
		}
	}

	private handleChange = (event, activeTab) => {
		this.setState({ activeTab });
	}

	public renderPinButton = renderWhenTrue(() => (
		<StyledFormControl>
			<PinButton
				onChange={this.props.onChangePin}
				onSave={this.props.onSavePin}
				disabled={!this.isNewRisk && !this.canEditBasicProperty}
				hasPin={this.props.hasPin}
			/>
		</StyledFormControl>
	));

	public showRiskContent = (active) => (
		<MainRiskFormTab
			active={active}
			isNewRisk={this.isNewRisk}
			canEditBasicProperty={this.canEditBasicProperty}
			canChangeAssigned={this.canChangeAssigned}
			renderPinButton={this.renderPinButton}
			{...this.props}
		/>
	)

	public showTreatmentContent = (active) => (
		<TreatmentRiskFormTab
			active={active}
			isNewRisk={this.isNewRisk}
			canEditBasicProperty={this.canEditBasicProperty}
			canEditRiskStatus={this.canEditRiskStatus}
			{...this.props}
		/>
	)

	public showAttachmentsContent = (active) => (
		<AttachmentsFormTab active={active} {...this.props} />
	)

	get attachmentsProps() {
		if (!this.isNewRisk) {
			return {
				label: RISK_TABS.ATTACHMENTS
			};
		}

		return {
			disabled: true,
			label: (
				<Tooltip title={`Save the ${VIEWER_PANELS_TITLES.risks} before adding an attachment`}>
					<span>{RISK_TABS.ATTACHMENTS}</span>
				</Tooltip>
			)
		};
	}

	public render() {
		const { activeTab } = this.state;
		return (
			<Form>
				<Tabs
					value={activeTab}
					indicatorColor="secondary"
					textColor="primary"
					fullWidth
					onChange={this.handleChange}
				>
					<Tab label={RISK_TABS.RISK} value={MAIN_RISK_TYPE} />
					<Tab label={RISK_TABS.TREATMENT} value={TREATMENT_RISK_TYPE} />
					<Tab {...this.attachmentsProps} value={ATTACHMENTS_RISK_TYPE} />
				</Tabs>
				<TabContent>
					{this.showRiskContent(activeTab === MAIN_RISK_TYPE)}
					{this.showTreatmentContent(activeTab === TREATMENT_RISK_TYPE)}
					{this.showAttachmentsContent(activeTab === ATTACHMENTS_RISK_TYPE)}
				</TabContent>
			</Form>
		);
	}
}

export const RiskDetailsForm = withFormik({
	mapPropsToValues: ({ risk }) => {
		return ({
			safetibase_id: risk.safetibase_id || '',
			associated_activity: risk.associated_activity || '',
			element: risk.element || '',
			risk_factor: risk.risk_factor || '',
			scope: risk.scope || '',
			location_desc: risk.location_desc || '',
			mitigation_status: risk.mitigation_status || '',
			mitigation_desc: risk.mitigation_desc || '',
			mitigation_detail: risk.mitigation_detail || '',
			mitigation_stage: risk.mitigation_stage || '',
			mitigation_type: risk.mitigation_type || '',
			desc: risk.desc || '',
			assigned_roles: get(risk, 'assigned_roles[0]', ''),
			category: risk.category || '',
			likelihood: risk.likelihood,
			consequence: risk.consequence,
			level_of_risk: risk.level_of_risk,
			residual_likelihood: risk.residual_likelihood,
			residual_consequence: risk.residual_consequence,
			residual_level_of_risk: risk.residual_level_of_risk,
			overall_level_of_risk: risk.overall_level_of_risk,
			residual_risk: risk.residual_risk
		});
	},
	handleSubmit: (values, { props }) => {
		(props as IProps).onSubmit(values);
	},
	enableReinitialize: true,
	validationSchema: RiskSchema
})(RiskDetailsFormComponent as any) as any;
