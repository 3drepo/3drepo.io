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
import { Group, GroupOverride, Viewpoint, ViewpointState } from '@/v5/store/tickets/tickets.types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { TreeActions } from '@/v4/modules/tree';
import { convertToV4GroupNodes, toGroupPropertiesDicts } from '@/v5/helpers/viewpoint.helpers';
import { cloneDeep, isEmpty, isString, isUndefined, uniqBy, xor } from 'lodash';
import { VIEWER_PANELS } from '@/v4/constants/viewerGui';
import { selectLeftPanels } from '@/v4/modules/viewerGui';
import { selectHiddenGeometryVisible } from '@/v4/modules/tree/tree.selectors';
import { TicketsCardActionsDispatchers, ViewpointsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { Container, Popper } from './ticketGroups.styles';
import { GroupsAccordion } from './groupsAccordion/groupsAccordion.component';
import { TicketGroupsContextComponent } from './ticketGroupsContext.component';
import { GroupSettingsForm } from './groups/groupActionMenu/groupSettingsForm/groupSettingsForm.component';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { VIEWER_EVENTS } from '@/v4/constants/viewer';

export const getPossiblePrefixes = (overrides: GroupOverride[] = []): string[][] => {
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
const NO_EDIT_OVERRIDE_SELECTED = { override: null, type: OverrideType.COLORED, editing: false };

let count = 0;

export const TicketGroups = ({ value, onChange, onBlur }: TicketGroupsProps) => {
	const dispatch = useDispatch();
	const [editingOverride, setEditingOverride] = useState(NO_EDIT_OVERRIDE_SELECTED);
	const [highlightedOverride, setHighlightedOverride] = useState(NO_OVERRIDE_SELECTED);
	const [selectedHiddenIndexes, setSelectedHiddenIndexes] = useState([]);
	const [selectedColorIndexes, setSelectedColorIndexes] = useState((value.state?.colored || []).map((_, index) => index));
	const hasClearedOverrides = TicketsCardHooksSelectors.selectTicketHasClearedOverrides();
	const [isLoading, setIsLoading] = useState(hasClearedOverrides);


	const state: Partial<ViewpointState> = value.state || {};
	const leftPanels = useSelector(selectLeftPanels);
	const isSecondaryCard = leftPanels[0] !== VIEWER_PANELS.TICKETS;
	const store = useStore();

	const clearHighlightedIndex = () => setHighlightedOverride(NO_OVERRIDE_SELECTED);

	const onSetHighlightedIndex = (type) => (index) => setHighlightedOverride({ type, index });

	const getHighlightedIndexByType = (type) => {
		if (highlightedOverride.type !== type) return -1;
		return highlightedOverride.index;
	};

	const onDeleteGroups = (type) => (indexes) => {
		const newVal = cloneDeep(value);
		newVal.state[type] = newVal.state[type].filter((o, i) => !indexes.includes(i));
		onChange?.(newVal);
		if (highlightedOverride.type === type && indexes.includes(highlightedOverride.index)) {
			clearHighlightedIndex();
		}
	};

	const onSetEditGroup = (type) => (index) => {
		setEditingOverride({ override: cloneDeep(state?.[type]?.[index]), type, editing:true });
	};

	const onSelectedHiddenGroupChange = (indexes: number[]) => {
		setSelectedHiddenIndexes(indexes);
		if (highlightedOverride.type === OverrideType.HIDDEN && indexes.includes(highlightedOverride.index)) {
			setHighlightedOverride(NO_OVERRIDE_SELECTED);
		}
		const diffIndexes = xor(indexes, selectedHiddenIndexes);
		const hideNodes = indexes.length > selectedHiddenIndexes.length;
		const objects = diffIndexes.flatMap((i) => convertToV4GroupNodes((state.hidden[i]?.group as Group)?.objects));
		if (hideNodes) {
			dispatch(TreeActions.hideNodesBySharedIds(objects));
		} else {
			dispatch(TreeActions.showNodesBySharedIds(objects));
		}
	};

	const cancelEdition = () => setEditingOverride(NO_EDIT_OVERRIDE_SELECTED);

	const groupHasId = ({ group }: GroupOverride) => !!(group as Group)._id;
	const groupHasKey = ({ key }: GroupOverride) => !isUndefined(key);

	const onSubmit = (overrideValue) => {
		const newVal = cloneDeep(value || {});
		if (!newVal.state) {
			newVal.state = { showHidden: selectHiddenGeometryVisible(store.getState()) };
		}
		const groupsOfType = state[editingOverride.type];

		let index = groupsOfType?.findIndex(({ group, key }: any) =>  {
			// Is updating an existing group
			if (groupHasId(overrideValue)) { 
				return overrideValue.group._id === group._id;
			}

			// If updating a new group
			if (groupHasKey(overrideValue)) {
				return overrideValue.key === key;
			}
		});


		// It the group is no longer there it will be saved as a new group
		if (index === -1 && groupHasId(overrideValue)) {
			delete overrideValue.group._id; 
		}

		if (!groupHasId(overrideValue) && !groupHasKey(overrideValue)) {
			overrideValue.key = count++;
		}

		// If the group was not found in the groups array is a new group so it goes last
		if (index === -1) {
			index = groupsOfType?.length;
		}

		// If settingsFormGroups is undefined then this is the first group in the list
		if (!groupsOfType) {
			index = 0;
		}

		newVal.state[editingOverride.type] ||= [];
		newVal.state[editingOverride.type][index] = overrideValue;

		onChange?.(newVal);
		cancelEdition();

		if (highlightedOverride.index === index && editingOverride.type === highlightedOverride.type) {
			clearHighlightedIndex();
		}
	};

	useEffect(() => { onBlur?.(); }, [value]);

	useEffect(() => {
		if (highlightedOverride.index === NO_OVERRIDE_SELECTED.index) {
			dispatch(TreeActions.clearCurrentlySelected());
		}
	}, [highlightedOverride]);

	useEffect(() => {
		const colored = selectedColorIndexes.map((i) => state.colored[i]).filter(Boolean);
		if (colored.some(({ group }) => isString(group))) return;
		TicketsCardActionsDispatchers.setOverrides(toGroupPropertiesDicts(colored));
	}, [selectedColorIndexes, value]);

	useEffect(() => {
		if (!isLoading || !hasClearedOverrides) return;
		TicketsCardActionsDispatchers.setOverrides({ overrides: {}, transparencies: {} });
		setIsLoading(false);
	}, [hasClearedOverrides]);

	useEffect(() => {
		ViewpointsActionsDispatchers.clearColorOverrides();

		ViewerService.on(VIEWER_EVENTS.BACKGROUND_SELECTED, clearHighlightedIndex);

		TicketsCardActionsDispatchers.setEditingGroups(true);
		return () => {
			ViewerService.off(VIEWER_EVENTS.BACKGROUND_SELECTED, clearHighlightedIndex);
			TicketsCardActionsDispatchers.setEditingGroups(false);
		};
	}, []);

	const addKeyToGroupsWithoutIdentifier = (groups) => {
		const group = groups[0];
		if (!group || groupHasId(group) || groupHasKey(group)) return groups;
		return groups.map((groupOverride) => ({ ...groupOverride, key: count++ }));
	};

	useEffect(() => {
		const stateWithGroupsWithKeys = { ...state };
		if (state.colored) {
			stateWithGroupsWithKeys.colored = addKeyToGroupsWithoutIdentifier(state.colored);
		}
		if (state.hidden) {
			stateWithGroupsWithKeys.hidden = addKeyToGroupsWithoutIdentifier(state.hidden);
		}
		if (isEmpty(stateWithGroupsWithKeys)) return;
		onChange({ ...value, state: stateWithGroupsWithKeys });
	}, []);

	if (isLoading) return (<Loader />);

	return (
		<Container onClick={clearHighlightedIndex}>
			<TicketGroupsContextComponent
				groupType={OverrideType.COLORED}
				onDeleteGroups={onDeleteGroups(OverrideType.COLORED)}
				onSelectedGroupsChange={setSelectedColorIndexes}
				overrides={state.colored || []}
				onEditGroup={onSetEditGroup(OverrideType.COLORED)}
				highlightedIndex={getHighlightedIndexByType(OverrideType.COLORED)}
				clearHighlightedIndex={clearHighlightedIndex}
				setHighlightedIndex={onSetHighlightedIndex(OverrideType.COLORED)}
			>
				<GroupsAccordion
					title={formatMessage({ id: 'ticketCard.groups.coloured', defaultMessage: 'Coloured Groups' })}
				/>
			</TicketGroupsContextComponent>
			<TicketGroupsContextComponent
				groupType={OverrideType.HIDDEN}
				onDeleteGroups={onDeleteGroups(OverrideType.HIDDEN)}
				onSelectedGroupsChange={onSelectedHiddenGroupChange}
				overrides={state.hidden || []}
				onEditGroup={onSetEditGroup(OverrideType.HIDDEN)}
				highlightedIndex={getHighlightedIndexByType(OverrideType.HIDDEN)}
				setHighlightedIndex={onSetHighlightedIndex(OverrideType.HIDDEN)}
				clearHighlightedIndex={clearHighlightedIndex}
			>
				<GroupsAccordion
					title={formatMessage({ id: 'ticketCard.groups.hidden', defaultMessage: 'Hidden Groups' })}
				/>
			</TicketGroupsContextComponent>
			<Popper
				open={editingOverride.editing}
				style={{ /* style is required to override the default positioning style Popper gets */
					left: 460,
					top: isSecondaryCard ? 'unset' : 80,
					bottom: isSecondaryCard ? 95 : 'unset',
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<GroupSettingsForm
					value={editingOverride.override}
					onSubmit={onSubmit}
					onCancel={cancelEdition}
					prefixes={getPossiblePrefixes(state[editingOverride.type])}
					isColored={editingOverride.type === OverrideType.COLORED}
				/>
			</Popper>
		</Container>
	);
};
