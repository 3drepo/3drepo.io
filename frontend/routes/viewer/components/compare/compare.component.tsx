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
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import CompareIcon from '@material-ui/icons/Compare';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { Container, TabContent } from './compare.styles';
import { ViewerPanelContent, ViewerPanelFooter, ViewerPanelButton } from '../viewerPanel/viewerPanel.styles';
import { renderWhenTrue } from '../../../../helpers/rendering';

const DIFF_TAB = 'DIFF';
const CLASH_TAB = 'CLASH';

const COMPARE_TABS = {
	DIFF: '3d diff',
	CLASH: 'Instant clash'
};

interface IProps {
	className: string;
}

interface IState {
	activeTab: string;
}

export class Compare extends React.PureComponent<IProps, IState> {
	public state = {
		activeTab: DIFF_TAB
	};

	public handleChange = (event, activeTab) => {
		this.setState({activeTab});
	}

	public renderDiffTab = renderWhenTrue(() => (
		<div>diff content</div>
	));

	public renderClashTab = renderWhenTrue(() => (
		<div>clash content</div>
	));

	public handleCompare = () => {
		console.log('Compare');
	}

	public render() {
		return (
			<ViewerPanel
				title="Compare"
				Icon={<CompareIcon/>}
				renderActions={() => []}
				pending={false}
			>
				<ViewerPanelContent className="height-catcher">
					<Tabs
						value={this.state.activeTab}
						indicatorColor="primary"
						textColor="primary"
						fullWidth={true}
						onChange={this.handleChange}
					>
						<Tab label={COMPARE_TABS.DIFF} value={DIFF_TAB} disabled={false} />
						<Tab label={COMPARE_TABS.CLASH} value={CLASH_TAB} disabled={false} />
					</Tabs>
					<TabContent>
						{this.renderDiffTab(this.state.activeTab === DIFF_TAB)}
						{this.renderClashTab(this.state.activeTab === CLASH_TAB)}
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
}
