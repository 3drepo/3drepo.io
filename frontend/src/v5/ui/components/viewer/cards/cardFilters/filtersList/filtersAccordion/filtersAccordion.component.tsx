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

import { CollapsibleContainer, CollapseButton, ClearButton, CollapseButtonContainer, PaddedContainer, BottomLine, ChevronIconContainer } from './filtersAccordion.styles';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import CloseIcon from '@assets/icons/outlined/close-outlined.svg';
import ChevronIcon from '@assets/icons/outlined/thin_chevron-outlined.svg';

type FiltersAccordionProps = {
	onClear: () => void;
	children: any;
};
export const FiltersAccordion = ({ children, onClear }: FiltersAccordionProps) => {
	const [collapsed, setCollapsed] = useState(false);
	const filterContainerRef = useRef();
	const [canCollapse, setCanCollapse] = useState(false);
	
	const toggleCollapsedState = () => setCollapsed(!collapsed);

	useEffect(() => {
		if (!filterContainerRef.current) return;
		const filtersContainerHeight = Number(getComputedStyle(filterContainerRef.current).height.replace('px', ''));
		setCanCollapse(filtersContainerHeight > 32);
	}, [children]);

	return (
		<>
			<PaddedContainer $collapsed={collapsed}>
				<CollapsibleContainer ref={filterContainerRef}>
					{children}
				</CollapsibleContainer>
			</PaddedContainer>
			<BottomLine>
				{canCollapse && (
					<CollapseButtonContainer>
						<CollapseButton onClick={toggleCollapsedState}>
							{collapsed
								? <FormattedMessage id="filtersList.collapseButton.showMore" defaultMessage="Show more" />
								: <FormattedMessage id="filtersList.collapseButton.showLess" defaultMessage="Show less" />
							}
							<ChevronIconContainer $collapsed={collapsed}>
								<ChevronIcon />
							</ChevronIconContainer>
						</CollapseButton>
					</CollapseButtonContainer>
				)}
				<ClearButton onClick={onClear}>
					<FormattedMessage id="filtersList.clearAllButton" defaultMessage="Clear all" />
					<CloseIcon />
				</ClearButton>
			</BottomLine>
		</>
	);
};
