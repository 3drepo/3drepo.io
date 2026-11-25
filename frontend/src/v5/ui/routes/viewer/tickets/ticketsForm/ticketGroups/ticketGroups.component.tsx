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
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { TreeActions } from '@/v4/modules/tree';
import { convertToV4GroupNodes, toGroupPropertiesDicts } from '@/v5/helpers/viewpoint.helpers';
import { cloneDeep, isEmpty, isString, uniqBy } from 'lodash';
import { VIEWER_PANELS } from '@/v4/constants/viewerGui';
import { selectLeftPanels } from '@/v4/modules/viewerGui';
import { selectHiddenGeometryVisible } from '@/v4/modules/tree/tree.selectors';
import { TicketsCardActionsDispatchers, ViewpointsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { Container, Popper } from './ticketGroups.styles';
import { GroupsAccordion } from './groupsAccordion/groupsAccordion.component';
import { TicketGroupsContextComponent } from './ticketGroupsContext.component';
import { TicketGroupForm } from './groups/groupActionMenu/ticketGroupForm/ticketGroupForm.component';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { VIEWER_EVENTS } from '@/v4/constants/viewer';
import { v4 as uuid } from 'uuid';
import { TicketGroupsContextType } from './ticketGroupsContext';

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
	const colouredContextRef = useRef<TicketGroupsContextType | null>(null);
	const [initialized, setInitialized] = useState(false);

	const state: Partial<ViewpointState> = useMemo(() => {
		const currentState: Partial<ViewpointState> = value?.state || {};
		return {
			...currentState,
			colored: currentState.colored && addKeysToGroups(currentState.colored),
			hidden: currentState.hidden && addKeysToGroups(currentState.hidden),
			selected: currentState.selected && addKeysToGroups(currentState.selected),
			shown: currentState.shown && addKeysToGroups(currentState.shown),
		};
	}, [value]);
	const [selectedColouredKeys, setColouredKeys] = useState(NO_OVERRIDE_SELECTED);
	
	const [editingOverride, setEditingOverride] = useState(NO_EDIT_OVERRIDE_SELECTED);
	const hasClearedOverrides = TicketsCardHooksSelectors.selectTicketHasClearedOverrides();
	const [isLoading, setIsLoading] = useState(hasClearedOverrides);

	const leftPanels = useSelector(selectLeftPanels);
	const isSecondaryCard = leftPanels[0] !== VIEWER_PANELS.TICKETS;
	const store = useStore();

	const clearHighlightedKey = () => setColouredKeys(NO_OVERRIDE_SELECTED);

	const onSetHighlightedKey = (type) => (key) => setColouredKeys({ type, key });

	const getHighlightedKeyByType = (type) => {
		if (selectedColouredKeys.type !== type) return null;
		return selectedColouredKeys.key;
	};

	const onDeleteGroups = (type) => (keys: string[]) => {
		const newVal = cloneDeep(value);
		newVal.state[type] = state[type].filter((override) => !keys.includes(getGroupKey(override)));
		onChange?.(newVal);
		if (selectedColouredKeys.type === type && keys.includes(selectedColouredKeys.key)) {
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

	const onHiddenGroupsAction = (keys: string[]) => {
		const objects = keys.flatMap((key) => {
			const override = getGroupsByKey(OverrideType.HIDDEN).get(key)?.groupOverride;
			return override ? convertToV4GroupNodes(override.group as Group) : [];
		});

		if (objects.length) {
			dispatch(TreeActions.hideNodesBySharedIds(objects));
		}
	};

	const onShownGroupsAction = (keys: string[]) => {
		const objects = keys.flatMap((key) => {
			const override = getGroupsByKey(OverrideType.SHOWN).get(key)?.groupOverride;
			return override ? convertToV4GroupNodes(override.group as Group) : [];
		});

		if (objects.length) {
			dispatch(TreeActions.isolateNodesBySharedIds(objects));
		}
	};

	const onSelectedGroupsAction = (keys: string[]) => {
		dispatch(TreeActions.clearCurrentlySelected());
		keys.forEach((key) => {
			const override = getGroupsByKey(OverrideType.SELECTED).get(key)?.groupOverride;
			if (!override || isString(override.group)) return;
			const objects = convertToV4GroupNodes(override.group);
			dispatch(TreeActions.showNodesBySharedIds(objects));
			dispatch(TreeActions.selectNodesBySharedIds(
				objects,
				override.color?.map((component) => component / 255),
			));
		});
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

		if (selectedColouredKeys.key === overrideValue.key && editingOverride.type === selectedColouredKeys.type) {
			clearHighlightedKey();
		}
	};

	useEffect(() => {
		if (isDirty) onBlur?.();
	}, [value, isDirty]);

	useEffect(() => {
		if (!isLoading || !hasClearedOverrides) return;
		setIsLoading(false);
	}, [hasClearedOverrides, isLoading]);


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
		const hasMissingKeys = [...(state.colored || []), ...(state.selected || []), ...(state.shown || []), ...(state.hidden || [])]
			.some((override) => !override.key || getGroupKey(override) !== override.key);
		if (isEmpty(stateWithGroupsWithKeys) || !hasMissingKeys) return;
		onChange({ ...value, state: stateWithGroupsWithKeys });
	}, []);
	
	const onColouredGroupsAction = (overrideKeys, initializing = false) => {
		// When initializing the coloured context already has all the keys checked, so we don't need to toggle them.
		const checkedKeys = !initializing ? colouredContextRef.current?.toggleCollectionCheck(overrideKeys) : overrideKeys;
		const colored = checkedKeys
			.map((key) => getGroupsByKey(OverrideType.COLORED).get(key)?.groupOverride)
			.filter(Boolean);
		if (colored.some(({ group }) => isString(group))) return;
		TicketsCardActionsDispatchers.setOverrides(toGroupPropertiesDicts(colored));
	};
	
	useEffect(() => {
		if (isLoading) return;
		if (state.colored?.length > 0) onColouredGroupsAction(state.colored.map((override) => override.key), true);
		if (state.selected?.length > 0) onSelectedGroupsAction(state.selected?.map((override) => override.key));
		if (state.shown?.length > 0) onShownGroupsAction(state.shown?.map((override) => override.key));
		if (state.hidden?.length > 0) onHiddenGroupsAction(state.hidden?.map((override) => override.key));
		setInitialized(true);
	}, [isLoading]);


	useEffect(() => {
		if (!hasClearedOverrides || !initialized) return;
		colouredContextRef.current?.clearAllChecks();
	}, [hasClearedOverrides, initialized]);

	if (isLoading) return (<Loader />);
	return (
		<Container onClick={clearHighlightedKey}>
			{state.colored?.length > 0 && (
				<TicketGroupsContextComponent
					groupType={OverrideType.COLORED}
					onDeleteGroups={onDeleteGroups(OverrideType.COLORED)}
					ref={colouredContextRef}
					onOverrideAction={onColouredGroupsAction}
					overrides={state.colored}
					onEditGroup={onSetEditGroup(OverrideType.COLORED)}
					highlightedKey={getHighlightedKeyByType(OverrideType.COLORED)}
					setHighlightedKey={onSetHighlightedKey(OverrideType.COLORED)}
				>
					<GroupsAccordion
						title={formatMessage({ id: 'ticketCard.groups.coloured', defaultMessage: 'Coloured Groups' })}
					/>
				</TicketGroupsContextComponent>
			)}
			{state.selected?.length > 0 && (
				<TicketGroupsContextComponent
					groupType={OverrideType.SELECTED}
					onDeleteGroups={onDeleteGroups(OverrideType.SELECTED)}
					onOverrideAction={onSelectedGroupsAction}
					overrides={state.selected}
					onEditGroup={onSetEditGroup(OverrideType.SELECTED)}
					highlightedKey={getHighlightedKeyByType(OverrideType.SELECTED)}
					setHighlightedKey={onSetHighlightedKey(OverrideType.SELECTED)}
				>
					<GroupsAccordion
						title={formatMessage({ id: 'ticketCard.groups.selected', defaultMessage: 'Selected Groups' })}
					/>
				</TicketGroupsContextComponent>
			)}
			{state.shown?.length > 0 && (
				<TicketGroupsContextComponent
					groupType={OverrideType.SHOWN}
					onOverrideAction={onShownGroupsAction}
					onDeleteGroups={onDeleteGroups(OverrideType.SHOWN)}
					overrides={state.shown}
					onEditGroup={onSetEditGroup(OverrideType.SHOWN)}
					highlightedKey={getHighlightedKeyByType(OverrideType.SHOWN)}
					setHighlightedKey={onSetHighlightedKey(OverrideType.SHOWN)}
				>
					<GroupsAccordion
						title={formatMessage({ id: 'ticketCard.groups.shown', defaultMessage: 'Shown Groups' })}
					/>
				</TicketGroupsContextComponent>
			)}

			{state.hidden?.length > 0 && (
				<TicketGroupsContextComponent
					groupType={OverrideType.HIDDEN}
					onOverrideAction={onHiddenGroupsAction}
					onDeleteGroups={onDeleteGroups(OverrideType.HIDDEN)}
					overrides={state.hidden}
					onEditGroup={onSetEditGroup(OverrideType.HIDDEN)}
					highlightedKey={getHighlightedKeyByType(OverrideType.HIDDEN)}
					setHighlightedKey={onSetHighlightedKey(OverrideType.HIDDEN)}
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
				<TicketGroupForm
					value={editingOverride.override}
					onSubmit={onSubmit}
					onCancel={cancelEdition}
					prefixes={getPossiblePrefixes(state[editingOverride.type])}
					isColored={editingOverride.type === OverrideType.COLORED || editingOverride.type === OverrideType.SELECTED}
					disableOpacity={editingOverride.type === OverrideType.SELECTED}
				/>
			</Popper>
		</Container>
	);
};
