/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { HoverPopover } from '@controls/hoverPopover/hoverPopover.component';
import { AssigneeCircle } from '../assigneeCircle/assigneeCircle.component';
import { ExtraAssigneesPopover } from '../extraAssigneesCircle/extraAssigneesPopover.component';
import { ExtraAssigneesCircle } from '../extraAssigneesCircle/extraAssignees.styles';
import { AvatarsOpacityHandler, ClearIconContainer, Container } from './assigneeValuesDisplay.styles';
import ClearIcon from '@assets/icons/controls/clear_circle.svg';
import { formatMessage } from '@/v5/services/intl';

const DEFAULT_EMPTY_LIST_MESSAGE = formatMessage({ id: 'assignees.circleList.none', defaultMessage: 'None Selected' });

export type AssigneesValuesDisplayProps = {
	value: string | string[];
	maxItems?: number;
	onClear?: () => void;
	emptyListMessage?: string;
};
export const AssigneesValuesDisplay = ({
	value: valueRaw,
	maxItems = 3,
	onClear,
	emptyListMessage = DEFAULT_EMPTY_LIST_MESSAGE,
}: AssigneesValuesDisplayProps) => {
	const value = Array.isArray(valueRaw) ? valueRaw : [valueRaw].filter(Boolean);
	// Using this logic instead of a simple partition because ExtraAssigneesCircle needs to occupy
	// the last position when the overflow value is 2+. There is no point showing +1 overflow
	// since the overflowing assignee could just be displayed instead
	const overflowRequired = value.length > maxItems;
	const listedAssignees = overflowRequired ? value.slice(0, maxItems - 1) : value;
	const overflowValue = overflowRequired ? value.slice(maxItems - 1).length : 0;
	return (
		<Container>
			<AvatarsOpacityHandler>
				{!listedAssignees.length && emptyListMessage}
				{listedAssignees.map((assignee) => (
					<AssigneeCircle key={assignee} assignee={assignee} size="small" />
				))}
				{overflowRequired && (
					<HoverPopover
						anchor={(attrs) => <ExtraAssigneesCircle {...attrs}> +{overflowValue} </ExtraAssigneesCircle>}
					>
						<ExtraAssigneesPopover assignees={value} />
					</HoverPopover>
				)}
			</AvatarsOpacityHandler>
			{onClear && (
				<ClearIconContainer onClick={onClear}>
					<ClearIcon />
				</ClearIconContainer>
			)}
		</Container>
	);
};