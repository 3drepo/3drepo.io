/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { formatMessage } from '@/v5/services/intl';
import { Group, GroupOverride, IGroupSettingsForm, Viewpoint, ViewpointState } from '@/v5/store/tickets/tickets.types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { TreeActions } from '@/v4/modules/tree';
import { convertToV4GroupNodes, toColorAndTransparencyDicts } from '@/v5/helpers/viewpoint.helpers';
import { cloneDeep, isString, uniqBy, xor } from 'lodash';
import { VIEWER_PANELS } from '@/v4/constants/viewerGui';
import { selectLeftPanels } from '@/v4/modules/viewerGui';
import { selectHiddenGeometryVisible } from '@/v4/modules/tree/tree.selectors';
import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ViewpointsActions } from '@/v4/modules/viewpoints';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { Container, Popper } from './ticketGroups.styles';
import { GroupsAccordion } from './groupsAccordion/groupsAccordion.component';
import { TicketGroupsContextComponent } from './ticketGroupsContext.component';
import { GroupSettingsForm } from './groups/groupActionMenu/groupSettingsForm/groupSettingsForm.component';

const getPossiblePrefixes = (overrides: GroupOverride[] = []): string[][] => {
	const prefixes = overrides.map(({ prefix }) => (prefix)).filter(Boolean);
	const uniquePrefixes = uniqBy(prefixes, JSON.stringify);
	const allPrefixesWithDuplicates: string[][] = [];

	uniquePrefixes.forEach((prefix) => {
		const usedSegments: string[] = [];
		prefix.forEach((segment) => {
			allPrefixesWithDuplicates.push(usedSegments.concat(segment));
			usedSegments.push(segment);
		});
	});

	return uniqBy(allPrefixesWithDuplicates, JSON.stringify);
};

interface TicketGroupsProps {
	value?: Viewpoint;
	onChange?: (newvalue) => void;
	onBlur?: () => void;
}

enum OverrideType {
	COLORED = 'colored',
	HIDDEN = 'hidden',
}

const NO_OVERRIDE_SELECTED = { index: -1, type: OverrideType.COLORED };

export const TicketGroups = ({ value, onChange, onBlur }: TicketGroupsProps) => {
	const dispatch = useDispatch();
	const [editingOverride, setEditingOverride] = useState(NO_OVERRIDE_SELECTED);
	const [highlightedOverride, setHighlightedOverride] = useState(NO_OVERRIDE_SELECTED);
	const [selectedHiddenIndexes, setSelectedHiddenIndexes] = useState([]);
	const [selectedColorIndexes, setSelectedColorIndexes] = useState((value.state?.colored || []).map((_, index) => index));
	const hasClearedOverrides = TicketsCardHooksSelectors.selectTicketHasClearedOverrides();
	const [isLoading, setIsLoading] = useState(hasClearedOverrides);

	const state: Partial<ViewpointState> = value.state || {};
	const leftPanels = useSelector(selectLeftPanels);
	const isSecondaryCard = leftPanels[0] !== VIEWER_PANELS.TICKETS;
	const store = useStore();
	const settingsFormGroups = state[editingOverride.type];

	const clearHighlightedIndex = () => setHighlightedOverride(NO_OVERRIDE_SELECTED);

	const onSetHighlightedIndex = (type) => (index) => setHighlightedOverride({ type, index });

	const onIsHighlightedIndex = (type) => (index) => {
		if (highlightedOverride.type !== type) return false;
		return highlightedOverride.index === index;
	};

	const onDeleteGroups = (type) => (indexes) => {
		const newVal = cloneDeep(value);
		newVal.state[type] = newVal.state[type].filter((o, i) => !indexes.includes(i));
		onChange?.(newVal);
		if (highlightedOverride.type === type && indexes.includes(highlightedOverride.index)) {
			clearHighlightedIndex();
		}
	};

	const onSetEditGroup = (type) => (index) => setEditingOverride({ index, type });

	const onSelectedHiddenGroupChange = (indexes: number[]) => {
		setSelectedHiddenIndexes(indexes);
		const diffIndexes = xor(indexes, selectedHiddenIndexes);
		const hideNodes = indexes.length > selectedHiddenIndexes.length;
		const objects = diffIndexes.flatMap((i) => convertToV4GroupNodes((state.hidden[i]?.group as Group)?.objects));
		if (hideNodes) {
			dispatch(TreeActions.hideNodesBySharedIds(objects));
		} else {
			dispatch(TreeActions.showNodesBySharedIds(objects));
		}
	};

	const cancelEdition = () => setEditingOverride(NO_OVERRIDE_SELECTED);

	const onSubmit = (overrideValue) => {
		const newVal = cloneDeep(value || {});
		if (!newVal.state) {
			newVal.state = { showHidden: selectHiddenGeometryVisible(store.getState()) };
		}

		newVal.state[editingOverride.type] ||= [];
		newVal.state[editingOverride.type][editingOverride.index] = overrideValue;
		onChange?.(newVal);
		cancelEdition();
		setHighlightedOverride(editingOverride);
	};

	useEffect(() => { setTimeout(() => { onBlur?.(); }, 200); }, [value]);

	useEffect(() => {
		if (highlightedOverride.index === NO_OVERRIDE_SELECTED.index) {
			dispatch(TreeActions.clearCurrentlySelected());
		}
	}, [highlightedOverride]);

	useEffect(() => {
		const colored = selectedColorIndexes.map((i) => state.colored[i]).filter(Boolean);
		if (colored.some(({ group }) => isString(group))) return;
		TicketsCardActionsDispatchers.setOverrides(toColorAndTransparencyDicts(colored));
	}, [selectedColorIndexes, value]);

	useEffect(() => {
		if (!isLoading || !hasClearedOverrides) return;
		TicketsCardActionsDispatchers.setOverrides({ overrides: {}, transparencies: {} });
		setIsLoading(false);
	}, [hasClearedOverrides]);

	useEffect(() => {
		dispatch(ViewpointsActions.setSelectedViewpoint(null));
	}, []);

	if (isLoading) return (<Loader />);

	return (
		<Container onClick={clearHighlightedIndex}>
			<TicketGroupsContextComponent
				groupType="colored"
				onDeleteGroups={onDeleteGroups(OverrideType.COLORED)}
				onSelectedGroupsChange={setSelectedColorIndexes}
				overrides={state.colored || []}
				onEditGroup={onSetEditGroup(OverrideType.COLORED)}
				isHighlightedIndex={onIsHighlightedIndex(OverrideType.COLORED)}
				clearHighlightedIndex={clearHighlightedIndex}
				setHighlightedIndex={onSetHighlightedIndex(OverrideType.COLORED)}
			>
				<GroupsAccordion
					title={formatMessage({ id: 'ticketCard.groups.coloured', defaultMessage: 'Coloured Groups' })}
				/>
			</TicketGroupsContextComponent>
			<TicketGroupsContextComponent
				groupType="hidden"
				onDeleteGroups={onDeleteGroups(OverrideType.HIDDEN)}
				overrides={state.hidden || []}
				onEditGroup={onSetEditGroup(OverrideType.HIDDEN)}
				isHighlightedIndex={onIsHighlightedIndex(OverrideType.HIDDEN)}
				setHighlightedIndex={onSetHighlightedIndex(OverrideType.HIDDEN)}
				clearHighlightedIndex={clearHighlightedIndex}
				onSelectedGroupsChange={onSelectedHiddenGroupChange}
			>
				<GroupsAccordion
					title={formatMessage({ id: 'ticketCard.groups.hidden', defaultMessage: 'Hidden Groups' })}
				/>
			</TicketGroupsContextComponent>
			<Popper
				open={editingOverride.index !== NO_OVERRIDE_SELECTED.index}
				style={{ /* style is required to override the default positioning style Popper gets */
					left: 460,
					top: isSecondaryCard ? 'unset' : 80,
					bottom: isSecondaryCard ? 95 : 'unset',
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<GroupSettingsForm
					value={settingsFormGroups?.[editingOverride.index] as IGroupSettingsForm}
					onSubmit={onSubmit}
					onCancel={cancelEdition}
					prefixes={getPossiblePrefixes(settingsFormGroups)}
					isColored={editingOverride.type === OverrideType.COLORED}
				/>
			</Popper>
		</Container>
	);
};
