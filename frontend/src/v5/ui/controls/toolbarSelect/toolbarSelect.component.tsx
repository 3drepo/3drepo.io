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
import { Container, FloatingButtonsContainer, ToolbarButtonContainer } from './toolbarSelect.styles';
import { useEffect, useState } from 'react';
import { ToolbarSelectContext } from './toolbarSelectContext';
import { ToolbarButton } from '@components/shared/modalsDispatcher/templates/imagesModal/imageMarkup/markupToolbar/toolbarButton/toolbarButton.component';

type ToolbarSelectProps = {
	disabled?: boolean;
	onChange: (value) => void;
	children: any;
	renderToolbarButton?: ({ Icon, value }) => JSX.Element;
	value?: any;
	defaultIcon?: any;
	title: string;
	selected?: boolean;
};
export const ToolbarSelect = ({
	renderToolbarButton,
	disabled,
	onChange,
	children,
	value = null,
	defaultIcon = () => null,
	title,
	selected,
	...props
}: ToolbarSelectProps) => {
	const [expanded, setExpanded] = useState(false);
	const [selectedData, setSelectedData] = useState({ Icon: defaultIcon, value });

	const handleChange = (data) => {
		onChange(data.value);
		setSelectedData(data);
	};

	useEffect(() => {
		setSelectedData({ ...selectedData, value });
	}, [value]);

	return (
		<ToolbarSelectContext.Provider value={{ onChange: handleChange, expanded, setExpanded }}>
			<ClickAwayListener onClickAway={() => setExpanded(false)}>
				<Container>
					{expanded && (
						<FloatingButtonsContainer {...props}>
							{children}
						</FloatingButtonsContainer>
					)}
					<ToolbarButtonContainer onClick={() => setExpanded(!expanded)} disabled={disabled}>
						{renderToolbarButton
							? renderToolbarButton(selectedData)
							: <ToolbarButton title={expanded ? '' : title} Icon={selectedData.Icon} selected={selected} />
						}
					</ToolbarButtonContainer>
				</Container>
			</ClickAwayListener>
		</ToolbarSelectContext.Provider>
	);
};
