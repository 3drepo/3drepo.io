/**
 *  Copyright (C) 2025 3D Repo Ltd
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
import { Collapse } from '@mui/material';
import { Container, ControlsContainer } from './collapseControl.styles';

export type CollapseToggleProps = {
	expanded?: boolean;
};

export type CollapseControlProps = {
	children: ReactNode;
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
	onChangeCollapse?: (collapsed:boolean) => void;
	CollapseToggleComponent: (props: CollapseToggleProps) => JSX.Element;
};

export const CollapseControl = ({
	children,
	className,
	isLoading = false,
	defaultExpanded = true,
	interactableWhileLoading,
	unmountHidden,
	onChangeCollapse,
	CollapseToggleComponent,
}: CollapseControlProps): JSX.Element => {
	const [isExpanded, setIsExpanded] = useState(defaultExpanded);
	const [unmountChildren, setUnmountChildren] = useState(!defaultExpanded);

	const onTransitionEnd = () => {
		if (!unmountHidden) return;
		setUnmountChildren(!isExpanded);
	};

	useEffect(() =>{
		onChangeCollapse?.(!isExpanded);
	}, [isExpanded]);

	const toggleExpand = () => {
		setIsExpanded((state) => !state);
		if (!isExpanded && unmountHidden) {
			setUnmountChildren(false);
		}
	};

	return (
		<Container className={className} $isLoading={!interactableWhileLoading && isLoading}>
			<ControlsContainer onClick={toggleExpand}>
				<CollapseToggleComponent expanded={isExpanded} />
			</ControlsContainer>
			<Collapse in={isExpanded} onTransitionEnd={onTransitionEnd} >
				{(!unmountChildren || !unmountHidden)  && children}
			</Collapse>
		</Container>
	);
};
