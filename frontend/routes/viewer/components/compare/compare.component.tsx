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
import MoreIcon from '@material-ui/icons/MoreVert';
import CheckIcon from '@material-ui/icons/Check';

import { Tab, IconButton } from '@material-ui/core';

import {
	DIFF_COMPARE_TYPE,
	COMPARE_TABS,
	CLASH_COMPARE_TYPE,
	RENDERING_TYPES,
	RENDERING_TYPES_LIST,
	COMPARE_ACTIONS_MENU,
	COMPARE_SORT_TYPES
} from '../../../../constants/compare';
import {
	StyledListItem,
	IconWrapper,
	StyledItemText
} from '../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { ButtonMenu } from '../../../components/buttonMenu/buttonMenu.component';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { ViewerPanelContent, ViewerPanelButton } from '../viewerPanel/viewerPanel.styles';
import { CompareDiff } from './components/compareDiff';
import { CompareClash } from './components/compareClash';
import {
	Tabs,
	TabContent,
	SliderContainer,
	Slider,
	SliderLabels,
	SliderLabel,
	SliderWrapper,
	ViewerPanelFooter,
	MenuList
} from './compare.styles';
import { SORT_ORDER_TYPES } from '../../../../constants/sorting';
import { SortAmountUp, SortAmountDown } from '../../../components/fontAwesomeIcon';

interface IProps {
	className: string;
	activeTab: string;
	renderingType: number;
	compareModels: any[];
	sortType: string;
	sortOrder: string;
	isActive: boolean;
	isPending: boolean;
	isFederation: boolean;
	isModelLoaded: boolean;
	compareDisabled: boolean;
	toggleCompare: () => void;
	setSortType: (sortType) => void;
	onTabChange: (activeTab) => void;
	onRenderingTypeChange: (renderingType) => void;
	setComponentState: (state) => void;
}

const MenuButton = ({ IconProps, Icon, ...props }) => (
	<IconButton
		{...props}
		aria-label="Show filters menu"
		aria-haspopup="true"
	>
		<MoreIcon {...IconProps} />
	</IconButton>
);

export class Compare extends React.PureComponent<IProps, any> {
	get isDiffTabActive() {
		return this.props.activeTab === DIFF_COMPARE_TYPE;
	}

	get headerMenuItems() {
		const menuItems = [{
			...COMPARE_ACTIONS_MENU.SORT_BY_NAME,
			onClick: this.handleSortClick(COMPARE_SORT_TYPES.NAME)
		}];

		if (!this.isDiffTabActive) {
			menuItems.push({
				...COMPARE_ACTIONS_MENU.SORT_BY_TYPE,
				onClick: this.handleSortClick(COMPARE_SORT_TYPES.TYPE)
			});
		}

		return menuItems;
	}

	private renderDiffTab = renderWhenTrue(() => (
		<CompareDiff className="height-catcher" compareModels={this.props.compareModels} />
	));

	private renderClashTab = renderWhenTrue(() => (
		<CompareClash className="height-catcher" compareModels={this.props.compareModels} />
	));

	public render() {
		const { activeTab, isActive, toggleCompare, compareDisabled } = this.props;

		return (
			<ViewerPanel
				title="Compare"
				Icon={<CompareIcon/>}
				renderActions={this.renderHeaderButtons}
				pending={this.props.isPending}
			>
				<ViewerPanelContent scrollDisabled={true}>
					<Tabs
						value={activeTab}
						indicatorColor="secondary"
						textColor="primary"
						fullWidth={true}
						onChange={this.handleChange}
						className="height-catcher--partial"
					>
						<Tab label={COMPARE_TABS.DIFF} value={DIFF_COMPARE_TYPE} disabled={false} />
						<Tab label={COMPARE_TABS.CLASH} value={CLASH_COMPARE_TYPE} disabled={!this.props.isFederation} />
					</Tabs>
					<TabContent>
						{this.renderDiffTab(this.isDiffTabActive)}
						{this.renderClashTab(!this.isDiffTabActive)}
					</TabContent>
				</ViewerPanelContent>
				<ViewerPanelFooter
					className="height-catcher--partial"
					alignItems="center"
					justify="space-between"
				>
					{this.renderSlider()}
					<ViewerPanelButton
						aria-label="Compare"
						onClick={toggleCompare}
						color="secondary"
						variant="fab"
						disabled={compareDisabled}
						active={Number(isActive)}
					>
						<CompareIcon />
					</ViewerPanelButton>
				</ViewerPanelFooter>
			</ViewerPanel>
		);
	}

	private renderHeaderButtons = () => {
		return (
			<ButtonMenu
				renderButton={MenuButton}
				renderContent={this.renderMenu}
				PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
				PopoverProps={{ anchorOrigin: { vertical: 'center', horizontal: 'left' } }}
				ButtonProps={{ disabled: false }}
			/>
		);
	}

	private renderMenu = () => {
		const { sortOrder } = this.props;
		return (
			<MenuList>
				{this.headerMenuItems.map(({ label, onClick, sortType }, index) => {
					const isEnabled = this.props.sortType === sortType;
					const isAscending = !isEnabled || sortOrder === SORT_ORDER_TYPES.ASCENDING;
					return (
						<StyledListItem key={index} button onClick={onClick}>
							<IconWrapper>
								{isAscending && <SortAmountUp fontSize="small" />}
								{!isAscending && <SortAmountDown fontSize="small" />}
							</IconWrapper>
							<StyledItemText>
								{label}
								{sortType === this.props.sortType && <CheckIcon fontSize="small" />}
							</StyledItemText>
						</StyledListItem>
					);
				})}
			</MenuList>
		);
	}

	private handleSortClick = (sortType) => () => this.props.setSortType(sortType);

	private handleRenderingTypeClick = (type) => () => {
		if (this.props.isActive) {
			this.props.onRenderingTypeChange(type);
		}
	}

	private handleRenderingTypeChange = (event, type) => {
		this.props.onRenderingTypeChange(type);
	}

	private handleChange = (event, activeTab) => {
		this.props.onTabChange(activeTab);
	}

	private renderSlider = () => {
		const { renderingType, isActive} = this.props;
		return (
			<SliderContainer>
				<SliderWrapper>
					<Slider
						value={renderingType}
						min={RENDERING_TYPES.BASE}
						max={RENDERING_TYPES.TARGET}
						step={1}
						onChange={this.handleRenderingTypeChange}
						disabled={!isActive}
					/>
				</SliderWrapper>
				<SliderLabels>
					{RENDERING_TYPES_LIST.map(({ type, label }, index) => (
						<SliderLabel key={index} onClick={this.handleRenderingTypeClick(type)}>
							{label}
						</SliderLabel>
					))}
				</SliderLabels>
			</SliderContainer>
		);
	}}
