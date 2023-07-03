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
import { GroupOverride, IGroupSettingsForm, Viewpoint, ViewpointState } from '@/v5/store/tickets/tickets.types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { ViewpointsActions } from '@/v4/modules/viewpoints';
import { viewpointV5ToV4 } from '@/v5/helpers/viewpoint.helpers';
import { cloneDeep, uniqBy } from 'lodash';
import { VIEWER_PANELS } from '@/v4/constants/viewerGui';
import { selectLeftPanels } from '@/v4/modules/viewerGui';
import { selectHiddenGeometryVisible } from '@/v4/modules/tree/tree.selectors';
import { TreeActions } from '@/v4/modules/tree';
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

export const TicketGroups = ({ value, onChange, onBlur }: TicketGroupsProps) => {
	const dispatch = useDispatch();
	const [editingOverride, setEditingOverride] = useState<{ index: number, type: OverrideType }>({ index: -1, type: OverrideType.COLORED });
	const [highlightedOverride, setHighlightedOverride] = useState<{ index: number, type: OverrideType }>({ index: -1, type: null });

	const state: Partial<ViewpointState> = value.state || {};
	const leftPanels = useSelector(selectLeftPanels);
	const isSecondaryCard = leftPanels[0] !== VIEWER_PANELS.TICKETS;
	const store = useStore();
	const settingsFormGroups = value.state?.[((editingOverride.type === OverrideType.COLORED) ? 'colored' : 'hidden')];

	const onSetHighlightedIndex = (type) => (index) => {
		setHighlightedOverride({ type, index });
	};

	const getHighlightedIndex = (type) => {
		if (highlightedOverride.type !== type) return -1;
		return highlightedOverride.index;
	};

	const onDeleteColoredGroup = (index) => {
		const newVal = cloneDeep(value);
		newVal.state.colored.splice(index, 1);
		onChange?.(newVal);
		if (highlightedOverride.index === index) {
			setHighlightedOverride({ index: -1, type: OverrideType.COLORED });
		}
	};

	const onSetEditGroup = (type) => (index) => {
		setEditingOverride({ index, type });
	};

	const onCancel = () => {
		setEditingOverride({ index: -1, type: OverrideType.COLORED });
	};

	const onSubmit = (overrideValue) => {
		const newVal = cloneDeep(value || {});
		if (!newVal.state) {
			newVal.state = { showDefaultHidden: selectHiddenGeometryVisible(store.getState()) };
		}

		newVal.state[editingOverride.type] ||= [];
		newVal.state[editingOverride.type][editingOverride.index] = overrideValue;
		onChange?.(newVal);
		onCancel();
		setHighlightedOverride(editingOverride);
		dispatch(ViewpointsActions.setActiveViewpoint(null, null, viewpointV5ToV4(newVal)));
	};

	const onSelectedColoredGroupsChange = (indexes) => {
		const colored = indexes.map((i) => state.colored[i]);
		const view = { state: { colored } } as Viewpoint;
		dispatch(ViewpointsActions.setActiveViewpoint(null, null, viewpointV5ToV4(view)));
	};

	useEffect(() => { setTimeout(() => { onBlur?.(); }, 200); }, [value]);

	useEffect(() => {
		if (highlightedOverride.index === -1) {
			dispatch(TreeActions.clearCurrentlySelected());
		}
	}, [highlightedOverride]);

	return (
		<Container onClick={() => setHighlightedOverride({ index: -1, type: OverrideType.COLORED })}>
			<TicketGroupsContextComponent
				groupType="colored"
				onDeleteGroup={onDeleteColoredGroup}
				onSelectedGroupsChange={onSelectedColoredGroupsChange}
				overrides={state.colored || []}
				onEditGroup={onSetEditGroup(OverrideType.COLORED)}
				highlightedIndex={getHighlightedIndex(OverrideType.COLORED)}
				setHighlightedIndex={onSetHighlightedIndex(OverrideType.COLORED)}
			>
				<GroupsAccordion
					title={formatMessage({ id: 'ticketCard.groups.coloured', defaultMessage: 'Coloured Groups' })}
				/>
			</TicketGroupsContextComponent>
			<TicketGroupsContextComponent
				groupType="hidden"
				overrides={state.hidden || []}
				onEditGroup={onSetEditGroup(OverrideType.HIDDEN)}
				highlightedIndex={getHighlightedIndex(OverrideType.HIDDEN)}
				setHighlightedIndex={onSetHighlightedIndex(OverrideType.HIDDEN)}
			>
				<GroupsAccordion
					title={formatMessage({ id: 'ticketCard.groups.hidden', defaultMessage: 'Hidden Groups' })}
				/>
			</TicketGroupsContextComponent>
			<Popper
				open={editingOverride.index !== -1}
				style={{ /* style is required to override the default positioning style Popper gets */
					left: 460,
					top: isSecondaryCard ? 'unset' : 80,
					bottom: isSecondaryCard ? 40 : 'unset',
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<GroupSettingsForm
					value={settingsFormGroups?.[editingOverride.index] as IGroupSettingsForm}
					onSubmit={onSubmit}
					onCancel={onCancel}
					prefixes={getPossiblePrefixes(settingsFormGroups)}
				/>
			</Popper>
		</Container>
	);
};
