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

import { ClickAwayListener } from '@mui/material';
import { Container, FloatingButtonsContainer } from './toolbarSelect.styles';
import { useEffect, useState, type JSX } from 'react';
import { ToolbarSelectContext } from './toolbarSelectContext';
import { ToolbarButton } from '@components/shared/modalsDispatcher/templates/imagesModal/imageMarkup/markupToolbar/toolbarButton/toolbarButton.component';

type ToolbarSelectProps = {
	disabled?: boolean;
	onChange: (value) => void;
	children: any;
	renderToolbarButton?: ({ Icon, value, title, expanded }) => JSX.Element;
	value?: any;
	defaultIcon?: any;
	title: string;
	active?: boolean;
};
export const ToolbarSelect = ({
	renderToolbarButton,
	disabled,
	onChange,
	children,
	value = null,
	defaultIcon = () => null,
	title,
	active,
	...props
}: ToolbarSelectProps) => {
	const [expanded, setExpanded] = useState(false);
	const [selectedData, setSelectedData] = useState({ Icon: defaultIcon, value });
	const tooltipTitle = expanded ? '' : title;

	const handleChange = (data) => {
		onChange(data.value);
		setSelectedData(data);
	};

	useEffect(() => {
		setSelectedData({ ...selectedData, value });
	}, [value]);

	return (
		<ToolbarSelectContext.Provider value={{ onChange: handleChange, expanded, setExpanded, active, selectedValue: selectedData.value }}>
			<ClickAwayListener onClickAway={() => setExpanded(false)}>
				<Container $expanded={expanded}>
					{expanded && (
						<FloatingButtonsContainer {...props}>
							{children}
						</FloatingButtonsContainer>
					)}
					<div onClick={() => setExpanded(!expanded)}>
						{renderToolbarButton
							? renderToolbarButton({ ...selectedData, title: tooltipTitle, expanded })
							: <ToolbarButton title={tooltipTitle} Icon={selectedData.Icon} selected={active} $expanded={expanded} />
						}
					</div>
				</Container>
			</ClickAwayListener>
		</ToolbarSelectContext.Provider>
	);
};
