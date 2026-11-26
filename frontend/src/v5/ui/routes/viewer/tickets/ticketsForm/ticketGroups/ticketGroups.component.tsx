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
import { convertToV4GroupNodes } from '@/v5/helpers/viewpoint.helpers';
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
import { ColouredGroupsContextComponent } from './colouredGroupsContext.component';
import { TicketGroupForm } from './groups/groupActionMenu/ticketGroupForm/ticketGroupForm.component';
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

const getGroupId = ({ group }: GroupOverride) => (isString(group) ? group : group._id);
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

	const getGroupsByKey = (type: OverrideType) => new Map<string, GroupOverride>(
		(state?.[type] || []).map((groupOverride) => [getGroupKey(groupOverride), groupOverride]),
	);

	const onSetEditGroup = (type) => (key?: string) => {
		const override = key ? getGroupsByKey(type).get(key) : null;
		setEditingOverride({ override: cloneDeep(override), type, editing: true });
	};

	useEffect(() => {
		if (!newGroupsHandle) return;
		newGroupsHandle.current = { triggerNewGroup: onSetEditGroup };
	}, [onSetEditGroup, newGroupsHandle]);

	const unhighlightOverrides = (overrides: GroupOverride[]) => {
		const objects = overrides.flatMap(({ group }) => convertToV4GroupNodes(group as Group));
		if (objects.length) {
			dispatch(TreeActions.deselectNodesBySharedIds(objects));
		}
	};

	const onDeleteGroups = (type) => (keys: string[]) => {
		const newVal = cloneDeep(value);
		newVal.state[type] = state[type].filter((override) => !keys.includes(getGroupKey(override)));

		onChange?.(newVal);
		if (selectedColouredKeys.type === type && keys.includes(selectedColouredKeys.key)) {
			clearHighlightedKey();
		}
	};

	const onHiddenOverridesAction = (overrides: GroupOverride[]) => {
		const objects = overrides.flatMap(({ group }) => convertToV4GroupNodes(group as Group));

		if (objects.length) {
			unhighlightOverrides(overrides);
			dispatch(TreeActions.hideNodesBySharedIds(objects));
		}
	};

	const onHiddenGroupsAction = (keys: string[]) => {
		onHiddenOverridesAction(keys
			.map((key) => getGroupsByKey(OverrideType.HIDDEN).get(key)?.groupOverride)
			.filter(Boolean));
	};

	const onShownOverridesAction = (overrides: GroupOverride[]) => {
		const objects = overrides.flatMap(({ group }) => convertToV4GroupNodes(group as Group));

		if (objects.length) {
			unhighlightOverrides(overrides);
			dispatch(TreeActions.isolateNodesBySharedIds(objects));
		}
	};

	const onShownGroupsAction = (keys: string[]) => {
		onShownOverridesAction(keys
			.map((key) => getGroupsByKey(OverrideType.SHOWN).get(key)?.groupOverride)
			.filter(Boolean));
	};

	const onSelectedOverridesAction = (overrides: GroupOverride[], clearSelection = true) => {
		if (clearSelection) dispatch(TreeActions.clearCurrentlySelected());
		overrides.forEach((override) => {
			const objects = convertToV4GroupNodes(override.group as Group);
			dispatch(TreeActions.showNodesBySharedIds(objects));
			dispatch(TreeActions.selectNodesBySharedIds(
				objects,
				override.color?.map((component) => component / 255),
			));
		});
	};

	const onSelectedGroupsAction = (keys: string[]) => {
		onSelectedOverridesAction(keys
			.map((key) => getGroupsByKey(OverrideType.SELECTED).get(key)?.groupOverride)
			.filter(Boolean));
	};

	const cancelEdition = () => setEditingOverride(NO_EDIT_OVERRIDE_SELECTED);

	const onSubmit = (overrideValue) => {
		const newVal = cloneDeep(value || {});
		newVal.state = {
			...cloneDeep(state),
			showHidden: state.showHidden ?? selectHiddenGeometryVisible(store.getState()),
		};
		const groupsOfType = state[editingOverride.type] || [];
		const groupId = getGroupId(overrideValue);
		const key = groupId || overrideValue.key || editingOverride.override?.key || uuid();
		let index = groupsOfType.findIndex((override) => getGroupKey(override) === key);

		if (index === -1 && groupId) {
			delete overrideValue.group._id; 
		}

		overrideValue.key = index === -1 && groupId ? uuid() : key;

		if (index === -1) {
			index = groupsOfType?.length;
		}

		newVal.state[editingOverride.type] ||= [];
		newVal.state[editingOverride.type][index] = overrideValue;

		switch (editingOverride.type) {
			case OverrideType.SELECTED:
				onSelectedOverridesAction([overrideValue], false);
				break;
			case OverrideType.HIDDEN:
				onHiddenOverridesAction([overrideValue]);
				break;
			case OverrideType.SHOWN:
				onShownOverridesAction((newVal.state.shown || []).filter(({ group }) => !isString(group)));
				break;
			default:
				break;
		}

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
	
	useEffect(() => {
		if (isLoading) return;
		if (state.selected?.length > 0) onSelectedGroupsAction(state.selected?.map((override) => override.key));
		if (state.shown?.length > 0) onShownGroupsAction(state.shown?.map((override) => override.key));
		if (state.hidden?.length > 0) onHiddenGroupsAction(state.hidden?.map((override) => override.key));
	}, [isLoading]);

	if (isLoading) return (<Loader />);
	return (
		<Container onClick={clearHighlightedKey}>
			<ColouredGroupsContextComponent
				onDeleteGroups={onDeleteGroups(OverrideType.COLORED)}
				overrides={state.colored || []}
				onEditGroup={onSetEditGroup(OverrideType.COLORED)}
				highlightedKey={getHighlightedKeyByType(OverrideType.COLORED)}
				setHighlightedKey={onSetHighlightedKey(OverrideType.COLORED)}
				hasClearedOverrides={hasClearedOverrides}
			>
				{state.colored?.length > 0 && (
					<GroupsAccordion
						title={formatMessage({ id: 'ticketCard.groups.coloured', defaultMessage: 'Coloured Groups' })}
					/>
				)}
			</ColouredGroupsContextComponent>
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
