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
import CompareIcon from '@material-ui/icons/Compare';
import { Tab } from '@material-ui/core';

import { DIFF_COMPARE_TYPE, COMPARE_TABS, CLASH_COMPARE_TYPE } from '../../../../constants/compare';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { ViewerPanelContent, ViewerPanelFooter, ViewerPanelButton } from '../viewerPanel/viewerPanel.styles';
import { CompareDiff } from './components/compareDiff';
import { CompareClash } from './components/compareClash';
import { Tabs, TabContent } from './compare.styles';

interface IProps {
	className: string;
	activeTab: string;
	setComponentState: (state) => void;
}

interface IState {
	activeTab: string;
}

export class Compare extends React.PureComponent<IProps, IState> {
	get isDiffTabActive() {
		return this.props.activeTab === DIFF_COMPARE_TYPE;
	}

	private renderDiffTab = renderWhenTrue(() => (
		<CompareDiff />
	));

	private renderClashTab = renderWhenTrue(() => (
		<CompareClash />
	));

	public render() {
		const { activeTab } = this.props;
		return (
			<ViewerPanel
				title="Compare"
				Icon={<CompareIcon/>}
				renderActions={() => []}
				pending={false}
			>
				<ViewerPanelContent className="height-catcher">
					<Tabs
						value={activeTab}
						indicatorColor="secondary"
						textColor="primary"
						fullWidth={true}
						onChange={this.handleChange}
					>
						<Tab label={COMPARE_TABS.DIFF} value={DIFF_COMPARE_TYPE} disabled={false} />
						<Tab label={COMPARE_TABS.CLASH} value={CLASH_COMPARE_TYPE} disabled={false} />
					</Tabs>
					<TabContent>
						{this.renderDiffTab(this.isDiffTabActive)}
						{this.renderClashTab(!this.isDiffTabActive)}
					</TabContent>
				</ViewerPanelContent>
				<ViewerPanelFooter alignItems="center" justify="space-between">
					<ViewerPanelButton
						aria-label="Compare"
						onClick={this.handleCompare}
						color="secondary"
						variant="fab"
						disabled={false}
					>
						<CompareIcon />
					</ViewerPanelButton>
				</ViewerPanelFooter>
			</ViewerPanel>
		);
	}

	private handleChange = (event, activeTab) => {
		this.props.setComponentState({ activeTab });
	}

	private handleCompare = () => {
	}
}
