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

import { renderWhenTrue } from '../../../../helpers/rendering';
import { ILegend, ILegendComponentState } from '../../../../modules/legend/legend.redux';
import { EmptyStateInfo } from '../../../components/components.styles';
import {
	MenuList,
	StyledItemText,
	StyledListItem
} from '../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { PanelBarActions } from '../panelBarActions';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { LegendFooter } from './components/legendFooter';
import { LegendItem } from './components/legendItem';
import { PANEL_DEFAULT_HEIGHT, PANEL_DEFAULT_WIDTH } from './legend.constants';
import { Container } from './legend.styles';

interface IProps {
	isPending: boolean;
	fetchLegend: () => void;
	setDefault: () => void;
	reset: () => void;
	legend: ILegend[];
	isCurrentLegendDefault?: boolean;
	componentState: ILegendComponentState;
	newLegendEditMode: boolean;
	defaultPosition: {
		x: number;
		y: number;
	};
	height: number;
}

interface IState {
	legend: ILegend[];
	draggableDisabled: boolean;
}

export class Legend extends React.PureComponent<IProps, IState> {
	public state = {
		legend: [],
		draggableDisabled: false,
	};

	public componentDidMount() {
		const { legend, fetchLegend } = this.props;

		if (!legend || !legend.length) {
			fetchLegend();
		} else {
			this.setState({ legend });
		}
	}

	public componentDidUpdate(prevProps: Readonly<IProps>, prevState) {
		const { legend } = this.props;

		if (!isEqual(this.state.legend, legend)) {
			this.setState({ legend });
		}
	}

	public renderEmptyState = renderWhenTrue(() => (
		<EmptyStateInfo>No legend have been created yet</EmptyStateInfo>
	));

	public renderActionsMenu = () => (
		<MenuList>
			<StyledListItem disabled={this.props.isCurrentLegendDefault} button onClick={this.props.setDefault}>
				<StyledItemText>
					Set as default
				</StyledItemText>
			</StyledListItem>
			<StyledListItem disabled={this.props.isCurrentLegendDefault} button onClick={this.props.reset}>
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
			onMenuOpen={() => this.setState({ draggableDisabled: true })}
			onMenuClose={() => this.setState({ draggableDisabled: false })}
		/>
	)

	public renderNewLegendItem = renderWhenTrue(() => (
		<LegendItem
			{...this.props.componentState}
			autoFocus
			onPickerOpen={() => this.setState({ draggableDisabled: true })}
			onPickerClose={() => this.setState({ draggableDisabled: false })}
		/>
	));

	public renderLegendList = () => (
		<Container>
			{this.state.legend.map((item) => (
				<LegendItem
					key={item.name}
					{...item}
					onPickerOpen={() => this.setState({ draggableDisabled: true })}
					onPickerClose={() => this.setState({ draggableDisabled: false })}
				/>
			))}
			{this.renderNewLegendItem(this.props.newLegendEditMode)}
		</Container>
	)

	public render() {
		const { isPending, defaultPosition, height } = this.props;

		return (
			<Rnd
				dragHandleClassName="panelTitle"
				default={{
					...defaultPosition,
					width: PANEL_DEFAULT_WIDTH,
					height,
				}}
				minWidth={PANEL_DEFAULT_WIDTH - 40}
				minHeight={PANEL_DEFAULT_HEIGHT}
				bounds="#gui-container"
				disableDragging={this.state.draggableDisabled}
			>
				<ViewerPanel
					title="Sequence Legend"
					renderActions={() => this.renderActions()}
					pending={isPending}
				>
					{this.renderEmptyState(!this.state.legend.length && !this.props.newLegendEditMode)}
					{this.renderLegendList()}
					<LegendFooter isPending={isPending} />
				</ViewerPanel>
			</Rnd>
		);
	}
}
