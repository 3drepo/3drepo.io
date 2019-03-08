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
import { DateTime } from '../../../dateTime/dateTime.component';
import DynamicUsername from '../..//../dynamicUsername/dynamicUsername.container';
import {
	Container,
	UserMessage,
	SystemMessage,
	Info,
	MitigationMessage,
	MitigationDetail,
	MitigationDetailLabel,
	MitigationDetailRow,
	MitigationWrapper,
	Screenshot,
	ScreenshotMessage,
	ScreenshotWrapper
} from './log.styles';

import { renderWhenTrue } from '../../../../../helpers/rendering';
import {
	LEVELS_OF_RISK,
	RISK_CATEGORIES,
	RISK_CONSEQUENCES,
	RISK_LIKELIHOODS,
	RISK_MITIGATION_STATUSES
} from '../../../../../constants/risks';

interface IProps {
	comment: string;
	viewpoint: any;
	created: number;
	owner: string;
	action: any;
	companyName: string;
	userName: string;
	teamspace: string;
}

export class Log extends React.PureComponent<IProps, any> {
	get isScreenshot() {
		return this.props.viewpoint && this.props.viewpoint.screenshotPath;
	}

	get isAction() {
		return Boolean(this.props.action);
	}

	get isCommentWithScreenshot() {
		return Boolean(this.props.comment) && this.isScreenshot;
	}

	get isPlainComment() {
		return Boolean(this.props.comment) && !this.isScreenshot;
	}

	get isRiskMitigationComment() {
		return Boolean(this.props.mitigation) && undefined !== this.props.likelihood && undefined !== this.props.consequence;
	}

	get riskLikelihood() {
		return undefined !== this.props.likelihood && RISK_LIKELIHOODS.length > this.props.likelihood ?
			RISK_LIKELIHOODS[this.props.likelihood].name : "Unassigned";
	}

	get riskConsequence() {
		return undefined !== this.props.consequence && RISK_CONSEQUENCES.length > this.props.consequence ?
			RISK_CONSEQUENCES[this.props.consequence].name : "Unassigned";
	}

	public renderRiskMitigationMessage = renderWhenTrue(
		<>
			<MitigationWrapper withMessage={!!this.props.mitigation}>
				<MitigationDetailRow>
					<MitigationDetail>
						<MitigationDetailLabel>Risk Likelihood</MitigationDetailLabel>
						{this.props.likelihood && <MitigationMessage>{this.riskLikelihood}</MitigationMessage>}
					</MitigationDetail>
					<MitigationDetail>
						<MitigationDetailLabel>Risk Consequence</MitigationDetailLabel>
						{this.props.consequence && <MitigationMessage>{this.riskConsequence}</MitigationMessage>}
					</MitigationDetail>
				</MitigationDetailRow>
				<MitigationDetailRow>
					{this.props.mitigation && <MitigationMessage>{this.props.mitigation}</MitigationMessage>}
				</MitigationDetailRow>
			</MitigationWrapper>
		</>
	);

	public renderUserMessage = renderWhenTrue(
		<UserMessage>{this.props.comment}</UserMessage>
	);

	public renderSystemMessage = renderWhenTrue(
		<SystemMessage>
			{this.props.action ? this.props.action.text + " " : null}
			updated {this.props.action && this.props.action.from ? " from " + this.props.action.from + " " : null}
			{this.props.action && this.props.action.to ? " to " + this.props.action.to + " " : null}
			{this.props.owner ? " by " + this.props.owner + " " : null}
			at <DateTime value={this.props.created as any} format="HH:mm DD MMM" />
		</SystemMessage>
	);

	public renderScreenshotMessage = renderWhenTrue(
		<>
			<ScreenshotWrapper withMessage={!!this.props.comment}>
				{ this.props.viewpoint && this.props.viewpoint.screenshotPath ?
				<Screenshot src={this.props.viewpoint.screenshotPath} />
				: null }
			</ScreenshotWrapper>
			{this.props.comment && <ScreenshotMessage>{this.props.comment}</ScreenshotMessage>}
		</>
	);

	public renderInfo = renderWhenTrue(
		<Info>
			{<DynamicUsername teamspace={this.props.teamspace} name={this.props.owner} />}
			<DateTime value={this.props.created as any} format="HH:mm DD MMM" />
		</Info>
	);

	public render() {
		return (
			<Container>
				{this.renderSystemMessage(Boolean(this.props.action))}
				{this.renderUserMessage(this.isPlainComment)}
				{this.renderRiskMitigationMessage(this.isRiskMitigationComment)}
				{this.renderScreenshotMessage(this.isCommentWithScreenshot)}
				{this.renderInfo(!this.isAction)}
			</Container>
		);
	}
}
