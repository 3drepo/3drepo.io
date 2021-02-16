/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { isEqual } from 'lodash';
import { Rnd } from 'react-rnd';

import { ILegend } from '../../../../modules/legend/legend.redux';
import {
	MenuList,
	StyledItemText,
	StyledListItem
} from '../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { PanelBarActions } from '../panelBarActions';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { LegendFooter } from './components/legendFooter';
import { LegendItem } from './components/legendItem';
import { Container } from './legend.styles';

interface IProps {
	isPending: boolean;
	fetchLegend: () => void;
	setDefault: () => void;
	reset: () => void;
	legend: ILegend[];
}

interface IState {
	legend: ILegend[];
}

export class Legend extends React.Component<IProps, IState> {
	public state = {
		legend: [],
	};

	public componentDidMount() {
		const { legend, fetchLegend } = this.props;

		if (!legend || !legend.length) {
			fetchLegend();
		}
	}

	public componentDidUpdate(prevProps: Readonly<IProps>, prevState) {
		const { legend } = this.props;

		if (!isEqual(this.state.legend, legend)) {
			this.setState({ legend });
		}
	}

	public renderActionsMenu = () => (
		<MenuList>
			<StyledListItem button onClick={this.props.setDefault}>
				<StyledItemText>
					Set as default
				</StyledItemText>
			</StyledListItem>
			<StyledListItem button onClick={this.props.reset}>
				<StyledItemText>
					Reset to default
				</StyledItemText>
			</StyledListItem>
		</MenuList>
	)

	private renderActions = () =>    (
		<PanelBarActions
			menuLabel="Show groups menu"
			menuActions={this.renderActionsMenu}
			hideLock
			hideSearch
		/>
	)

	public renderLegendList = () => (
		<Container>
			{this.state.legend.map((item) => (
				<LegendItem key={`${item.name}-${item.color}`} {...item} />
			))}
		</Container>
	)

	public render() {
		const { isPending } = this.props;

		return (
			<Rnd
				default={{
					x: 500,
					y: 300,
					width: 380,
					height: '30%',
				}}
				minHeight="30%"
				dragHandleClassName="panelTitle"
			>
				<ViewerPanel
					title="Sequence Legend"
					renderActions={() => this.renderActions()}
					pending={isPending}
				>
					{this.renderLegendList()}
					<LegendFooter isPending={isPending} />
				</ViewerPanel>
			</Rnd>
		);
	}
}
