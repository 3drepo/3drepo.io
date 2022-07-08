/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import Visibility from '@mui/icons-material/VisibilityOutlined';
import { ArrowButton, StyledArrowIcon } from '@/v4/routes/viewerGui/components/previewListItem/previewListItem.styles';
import { TooltipButton } from '@/v4/routes/teamspaces/components/tooltipButton/tooltipButton.component';
import { Checkbox } from '@mui/material';
import { ButtonsContainer, GroupsTreeListItem, GroupsTreeListItemContainer } from './groupLists.styles';

interface Props {
	onClick: (event: any) => void;
	onClickIsolate: (event: any) => void;
	onClickGotoDetails?: (event: any) => void;
	onClickOverride: (event: any) => void;
	disabled: boolean;
	highlighted: boolean;
	overriden: boolean;
	depth: number;
	active?: boolean;
	children: any;
	grandChildren?: any[] | null;
}

export const GroupsTreeListItemComponent = (
	{
		onClick,
		onClickIsolate,
		onClickGotoDetails,
		onClickOverride,
		disabled,
		highlighted,
		overriden,
		depth,
		active,
		children,
		grandChildren,
	}:Props,
) => (
	<GroupsTreeListItem onClick={onClick} $highlighted={highlighted}>
		<GroupsTreeListItemContainer $depth={depth}>
			{children}
			<ButtonsContainer>
				<TooltipButton action={onClickIsolate} label="Isolate" Icon={Visibility} disabled={disabled} />
				<Checkbox onClick={onClickOverride} checked={overriden} indeterminate={overriden === undefined} />
			</ButtonsContainer>
			{active
			&& (
				<ArrowButton onClick={onClickGotoDetails} disabled={disabled}>
					<StyledArrowIcon />
				</ArrowButton>
			)}
		</GroupsTreeListItemContainer>
		{grandChildren}
	</GroupsTreeListItem>
);
