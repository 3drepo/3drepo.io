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
import { Group, GroupOverride, OverrideType, Viewpoint, ViewpointState } from '@/v5/store/tickets/tickets.types';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { TreeActions } from '@/v4/modules/tree';
import { convertToV4GroupNodes, toGroupPropertiesDicts } from '@/v5/helpers/viewpoint.helpers';
import { cloneDeep, isEmpty, isString, uniqBy, xor } from 'lodash';
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
import { v4 as uuid } from 'uuid';

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
	isDirty?: boolean;
	newGroupsHandle?: any;
}

const NO_OVERRIDE_SELECTED = { key: null, type: OverrideType.COLORED };
const NO_EDIT_OVERRIDE_SELECTED = { override: null, type: OverrideType.COLORED, editing: false };

const getGroupId = ({ group }: GroupOverride) => (isString(group) ? undefined : group._id);
const getGroupKey = ({ group, key }: GroupOverride): string => getGroupId({ group, key }) || key || '';
const addKeysToGroups = (groups: GroupOverride[] = []) => groups.map((groupOverride) => ({
	...groupOverride,
	key: getGroupId(groupOverride) || groupOverride.key || uuid(),
}));

export const TicketGroups = ({ value, onChange, onBlur, isDirty, newGroupsHandle }: TicketGroupsProps) => {
	const dispatch = useDispatch();
	const state: Partial<ViewpointState> = useMemo(() => {
		const currentState: Partial<ViewpointState> = value?.state || {};
		return {
			...currentState,
			colored: currentState.colored && addKeysToGroups(currentState.colored),
			hidden: currentState.hidden && addKeysToGroups(currentState.hidden),
		};
	}, [value]);
	const [editingOverride, setEditingOverride] = useState(NO_EDIT_OVERRIDE_SELECTED);
	const [highlightedOverride, setHighlightedOverride] = useState(NO_OVERRIDE_SELECTED);
	const [selectedHiddenKeys, setSelectedHiddenKeys] = useState<string[]>(() => (state.hidden || []).map(({ key }) => key));
	const [selectedColorKeys, setSelectedColorKeys] = useState<string[]>(() => (state.colored || []).map(({ key }) => key));
	const hasClearedOverrides = TicketsCardHooksSelectors.selectTicketHasClearedOverrides();
	const [isLoading, setIsLoading] = useState(hasClearedOverrides);

	const leftPanels = useSelector(selectLeftPanels);
	const isSecondaryCard = leftPanels[0] !== VIEWER_PANELS.TICKETS;
	const store = useStore();

	const clearHighlightedKey = () => setHighlightedOverride(NO_OVERRIDE_SELECTED);

	const onSetHighlightedKey = (type) => (key) => setHighlightedOverride({ type, key });

	const getHighlightedKeyByType = (type) => {
		if (highlightedOverride.type !== type) return null;
		return highlightedOverride.key;
	};

	const onDeleteGroups = (type) => (keys: string[]) => {
		const newVal = cloneDeep(value);
		newVal.state[type] = state[type].filter((override) => !keys.includes(getGroupKey(override)));
		onChange?.(newVal);
		if (highlightedOverride.type === type && keys.includes(highlightedOverride.key)) {
			clearHighlightedKey();
		}
	};

	const getGroupsByKey = (type: OverrideType) => new Map<string, { groupOverride: GroupOverride, index: number }>(
		(state?.[type] || []).map((groupOverride, index) => [getGroupKey(groupOverride), { groupOverride, index }]),
	);

	const onSetEditGroup = (type) => (key?: string) => {
		const override = key ? getGroupsByKey(type).get(key)?.groupOverride : null;
		setEditingOverride({ override: cloneDeep(override), type, editing: true });
	};

	useEffect(() => {
		if (!newGroupsHandle) return;
		newGroupsHandle.current = { triggerNewGroup: onSetEditGroup };
	}, [onSetEditGroup, newGroupsHandle]);

	const onSelectedHiddenGroupChange = (keys: string[]) => {
		setSelectedHiddenKeys(keys);
		if (highlightedOverride.type === OverrideType.HIDDEN && keys.includes(highlightedOverride.key)) {
			setHighlightedOverride(NO_OVERRIDE_SELECTED);
		}
		const diffKeys = xor(keys, selectedHiddenKeys);
		const hideNodes = keys.length > selectedHiddenKeys.length;
		const objects = diffKeys.flatMap((key) => {
			const override = getGroupsByKey(OverrideType.HIDDEN).get(key)?.groupOverride;
			return override ? convertToV4GroupNodes(override.group as Group) : [];
		});
		if (hideNodes) {
			dispatch(TreeActions.hideNodesBySharedIds(objects));
		} else {
			dispatch(TreeActions.showNodesBySharedIds(objects));
		}
	};

	const cancelEdition = () => setEditingOverride(NO_EDIT_OVERRIDE_SELECTED);

	const onSubmit = (overrideValue) => {
		const newVal = cloneDeep(value || {});
		newVal.state = {
			...cloneDeep(state),
			showHidden: state.showHidden ?? selectHiddenGeometryVisible(store.getState()),
		};
		const groupsOfType = state[editingOverride.type] || [];
		const groupsByKey = getGroupsByKey(editingOverride.type);
		const groupId = getGroupId(overrideValue);
		const key = groupId || overrideValue.key || editingOverride.override?.key || uuid();
		let index = groupsByKey.get(key)?.index ?? -1;

		if (index === -1 && groupId) {
			delete overrideValue.group._id; 
		}

		overrideValue.key = index === -1 && groupId ? uuid() : key;

		if (index === -1) {
			index = groupsOfType?.length;
		}

		newVal.state[editingOverride.type] ||= [];
		newVal.state[editingOverride.type][index] = overrideValue;

		onChange?.(newVal);
		cancelEdition();

		if (highlightedOverride.key === overrideValue.key && editingOverride.type === highlightedOverride.type) {
			clearHighlightedKey();
		}
	};

	useEffect(() => {
		if (isDirty) onBlur?.();
	}, [value, isDirty]);

	useEffect(() => {
		if (highlightedOverride.key === NO_OVERRIDE_SELECTED.key) {
			dispatch(TreeActions.clearCurrentlySelected());
		}
	}, [highlightedOverride]);

	useEffect(() => {
		const colored = selectedColorKeys
			.map((key) => getGroupsByKey(OverrideType.COLORED).get(key)?.groupOverride)
			.filter(Boolean);
		if (colored.some(({ group }) => isString(group))) return;
		TicketsCardActionsDispatchers.setOverrides(toGroupPropertiesDicts(colored));
	}, [selectedColorKeys, value]);

	useEffect(() => {
		if (!isLoading || !hasClearedOverrides) return;
		setIsLoading(false);
	}, [hasClearedOverrides]);

	useEffect(() => {
		ViewpointsActionsDispatchers.clearColorOverrides();

		ViewerService.on(VIEWER_EVENTS.BACKGROUND_SELECTED, clearHighlightedKey);

		TicketsCardActionsDispatchers.setEditingGroups(true);
		return () => {
			ViewerService.off(VIEWER_EVENTS.BACKGROUND_SELECTED, clearHighlightedKey);
			TicketsCardActionsDispatchers.setEditingGroups(false);
		};
	}, []);

	useEffect(() => {
		const stateWithGroupsWithKeys = { ...state };
		const hasMissingKeys = [...(state.colored || []), ...(state.hidden || [])]
			.some((override) => !override.key || getGroupKey(override) !== override.key);
		if (isEmpty(stateWithGroupsWithKeys) || !hasMissingKeys) return;
		onChange({ ...value, state: stateWithGroupsWithKeys });
	}, []);

	if (isLoading) return (<Loader />);
	return (
		<Container onClick={clearHighlightedKey}>
			{state.colored && (
				<TicketGroupsContextComponent
					groupType={OverrideType.COLORED}
					onDeleteGroups={onDeleteGroups(OverrideType.COLORED)}
					onSelectedGroupsChange={setSelectedColorKeys}
					overrides={state.colored}
					onEditGroup={onSetEditGroup(OverrideType.COLORED)}
					highlightedKey={getHighlightedKeyByType(OverrideType.COLORED)}
					clearHighlightedKey={clearHighlightedKey}
					setHighlightedKey={onSetHighlightedKey(OverrideType.COLORED)}
				>
					<GroupsAccordion
						title={formatMessage({ id: 'ticketCard.groups.coloured', defaultMessage: 'Coloured Groups' })}
					/>
				</TicketGroupsContextComponent>
			)}
			{state.hidden && (
				<TicketGroupsContextComponent
					groupType={OverrideType.HIDDEN}
					onDeleteGroups={onDeleteGroups(OverrideType.HIDDEN)}
					onSelectedGroupsChange={onSelectedHiddenGroupChange}
					overrides={state.hidden}
					onEditGroup={onSetEditGroup(OverrideType.HIDDEN)}
					highlightedKey={getHighlightedKeyByType(OverrideType.HIDDEN)}
					setHighlightedKey={onSetHighlightedKey(OverrideType.HIDDEN)}
					clearHighlightedKey={clearHighlightedKey}
				>
					<GroupsAccordion
						title={formatMessage({ id: 'ticketCard.groups.hidden', defaultMessage: 'Hidden Groups' })}
					/>
				</TicketGroupsContextComponent>
			)}
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
