/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { ReactNode, useEffect, useState } from 'react';
import { Collapse, Tooltip } from '@mui/material';
import { ButtonContainer, ControlsContainer, CollapsedItemContainer, Title, ChevronButton, Container } from './dashboardListCollapse.styles';

export type IDashboardListCollapse = {
	children: ReactNode;
	title: ReactNode;
	tooltipTitles?: {
		visible: ReactNode;
		collapsed: ReactNode;
	},
	className?: string;
	sideElement?: ReactNode;
	isLoading?: boolean;
	interactableWhileLoading?: boolean;
	defaultExpanded?: boolean;
	unmountHidden?: boolean;
};

export const DashboardListCollapse = ({
	children,
	title,
	tooltipTitles,
	className,
	isLoading = false,
	defaultExpanded = true,
	sideElement,
	interactableWhileLoading,
	unmountHidden,
}: IDashboardListCollapse): JSX.Element => {
	const [isExpanded, setIsExpanded] = useState(defaultExpanded);
	const [unmountChildren, setUnmountChildren] = useState(!defaultExpanded);

	const onTransitionEnd = () => {
		if (!unmountHidden) return;
		setUnmountChildren(!isExpanded);
	};

	return (
		<Container className={className} $isLoading={!interactableWhileLoading && isLoading}>
			<ControlsContainer>
				<ButtonContainer onClick={() => {
					setIsExpanded((state) => !state);
					if (!isExpanded && unmountHidden) {
						setUnmountChildren(false);
					}
				}}>
					<Tooltip title={(isExpanded ? tooltipTitles?.visible : tooltipTitles?.collapsed) ?? ''}>
						<ChevronButton isOn={isExpanded} isLoading={isLoading} />
					</Tooltip>
					<Title variant="h3" color="secondary">{title}</Title>
				</ButtonContainer>
				{sideElement}
			</ControlsContainer>
			<Collapse in={isExpanded} onTransitionEnd={onTransitionEnd} >
				<CollapsedItemContainer>
					{!unmountChildren  && children}
				</CollapsedItemContainer>
			</Collapse>
		</Container>
	);
};
