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

import { Tab, Tooltip } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';

import {
	CLASH_COMPARE_TYPE,
	COMPARE_ACTIONS_MENU,
	COMPARE_SORT_TYPES,
	COMPARE_TABS,
	DIFF_COMPARE_TYPE,
	RENDERING_TYPES,
	RENDERING_TYPES_LIST
} from '../../../../constants/compare';
import { SORT_ORDER_TYPES } from '../../../../constants/sorting';
import { VIEWER_PANELS } from '../../../../constants/viewerGui';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { ICompareComponentState } from '../../../../modules/compare/compare.redux';
import {
	IconWrapper,
	StyledItemText,
	StyledListItem
} from '../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { SortAmountDown, SortAmountUp } from '../../../components/fontAwesomeIcon';
import { Loader } from '../../../components/loader/loader.component';
import { PanelBarActions } from '../panelBarActions';
import { ViewerPanelButton, ViewerPanelContent } from '../viewerPanel/viewerPanel.styles';
import {
	CompareContainer,
	CompareIcon,
	ComparisonLoader,
	MenuList,
	Slider,
	SliderContainer,
	SliderLabel,
	SliderLabels,
	SliderWrapper,
	Tabs,
	TabContent,
	ViewerPanelFooter
} from './compare.styles';
import { CompareClash } from './components/compareClash';
import { CompareDiff } from './components/compareDiff';

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
	selectedItemsMap: any[];
	isCompareProcessed: boolean;
	canTestForClash: boolean;
	revision?: string;
	toggleCompare: () => void;
	setSortType: (sortType) => void;
	onTabChange: (activeTab) => void;
	onRenderingTypeChange: (renderingType) => void;
	setTargetModel: (modelId, isTarget, isTypeChange?) => void;
	setComponentState: (state) => void;
	setTargetRevision: (modelId, targetRevision, isDiff) => void;
	id?: string;
}

export class Compare extends React.PureComponent<IProps, any> {

	get type() {
		return VIEWER_PANELS.COMPARE;
	}

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

	get tabProps() {
		return {
			compareModels: this.props.compareModels,
			handleItemSelect: this.handleItemSelect,
			handleAllItemsSelect: this.handleAllItemsSelect,
			renderComparisonLoader: () => this.renderComparisonLoader(this.props.isCompareProcessed)
		};
	}

	public renderComparisonLoader = renderWhenTrue(() => (
		<ComparisonLoader>
			<Loader content="Loading comparison" />
		</ComparisonLoader>
	));

	private renderDiffContent = renderWhenTrue(() => (
		<CompareDiff {...this.tabProps} />
	));

	private renderClashContent = renderWhenTrue(() => (
		<CompareClash {...this.tabProps} />
	));

	public componentDidMount() {
		// if (!this.props.compareModels.length) {
		// 	this.props.getCompareModels(this.props.revision);
		// }
	}

	public renderClashTabLabel = () => {
		if (this.props.isFederation) {
			return COMPARE_TABS.CLASH;
		}
		return (
			<Tooltip title="Only available in federations">
				<span>{COMPARE_TABS.CLASH}</span>
			</Tooltip>
		);
	}

	public render() {
		const {
			isPending,
			compareModels,
			activeTab,
			isActive,
			toggleCompare,
			compareDisabled,
			isCompareProcessed,
			isFederation,
			canTestForClash,
		} = this.props;
		return (
			<CompareContainer
				Icon={<CompareIcon />}
				renderActions={this.renderActions}
				pending={isPending}
				empty={!isPending && !compareModels.length}
				id={this.props.id}
			>
				<ViewerPanelContent scrollDisabled>
					<Tabs
						value={activeTab}
						indicatorColor="secondary"
						textColor="primary"
						onChange={this.handleChange}
						variant="fullWidth"
					>
						<Tab label={COMPARE_TABS.DIFF} value={DIFF_COMPARE_TYPE} disabled={isCompareProcessed} />
						<Tab
							style={{ pointerEvents: 'auto' }}
							label={this.renderClashTabLabel()}
							value={CLASH_COMPARE_TYPE}
							disabled={!isFederation || isCompareProcessed}
						/>
					</Tabs>
					<TabContent>
						{this.renderDiffContent(this.isDiffTabActive)}
						{this.renderClashContent(!this.isDiffTabActive)}
					</TabContent>
				</ViewerPanelContent>
				<ViewerPanelFooter container alignItems="center" justify="space-between">
					{this.renderSlider()}
					<ViewerPanelButton
							aria-label="Compare"
							onClick={toggleCompare}
							color="secondary"
							variant="fab"
							disabled={compareDisabled || (!this.isDiffTabActive && !canTestForClash)}
							active={Number(isActive)}
					>
						<CompareIcon />
					</ViewerPanelButton>
				</ViewerPanelFooter>
			</CompareContainer>
		);
	}

	private renderActions = () => (
		<PanelBarActions
			type={this.type}
			menuLabel="Show filters menu"
			menuActions={this.renderActionsMenu}
			menuDisabled={this.props.isCompareProcessed}
			hideSearch
		/>
	)

	private renderActionsMenu = () => (
		<MenuList>
			{this.headerMenuItems.map(({ label, onClick, sortType }, index) => {
				const isEnabled = this.props.sortType === sortType;
				const isAscending = !isEnabled || this.props.sortOrder === SORT_ORDER_TYPES.ASCENDING;
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
	)

	private handleItemSelect = (modelProps) => (event, selected) => {
		const { selectedItemsMap, setComponentState, setTargetModel } = this.props;
		const changedMap = this.isDiffTabActive ? 'selectedDiffModelsMap' : 'selectedClashModelsMap';
		setTargetModel(modelProps._id, selected);
		setComponentState({
			[changedMap]: {
				...selectedItemsMap,
				[modelProps._id]: selected
			}
		});
	}

	private handleAllItemsSelect = (event, selected) => {
		const { setComponentState, compareModels } = this.props;
		const newComponentState = {} as ICompareComponentState;
		const changedMap = this.isDiffTabActive ? 'selectedDiffModelsMap' : 'selectedClashModelsMap';

		newComponentState[changedMap] = compareModels.reduce((map, obj) => {
			map[obj._id] = selected;
			return map;
		}, {});

		newComponentState.targetDiffModels = newComponentState[changedMap];
		if (!selected) {
			newComponentState.targetClashModels = newComponentState[changedMap];
		}

		setComponentState(newComponentState);
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
		const { renderingType, isActive, isCompareProcessed } = this.props;
		return (
			<SliderContainer>
				<SliderWrapper>
					<Slider
						value={renderingType}
						min={RENDERING_TYPES.BASE}
						max={RENDERING_TYPES.TARGET}
						step={1}
						onChange={this.handleRenderingTypeChange}
						disabled={!isActive || isCompareProcessed}
					/>
				</SliderWrapper>
				<SliderLabels>
					{RENDERING_TYPES_LIST.map(({ type, label }, index) => (
						<SliderLabel key={index} onClick={this.handleRenderingTypeClick(type)} disabled={!isActive || isCompareProcessed}>
							{label}
						</SliderLabel>
					))}
				</SliderLabels>
			</SliderContainer>
		);
	}}
