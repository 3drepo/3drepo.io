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

import { useState, type JSX } from 'react';
import {
	AccordionSummary,
	AccordionDetails,
	Accordion as MuiAccordion,
	AccordionProps as MuiAccordionProps,
} from '@mui/material';
import { IconContainer, TitleContainer } from './accordion.styles';

export type AccordionProps = MuiAccordionProps & {
	Icon?: any;
	title: any | JSX.Element;
	children: any;
};

export const Accordion = ({ defaultExpanded = false, children, title, Icon, ...props }: AccordionProps) => {
	const [expanded, setExpanded] = useState(defaultExpanded);

	const toggleExpanded = () => setExpanded(!expanded);

	return (
		<MuiAccordion expanded={expanded} {...props}>
			<AccordionSummary onClick={toggleExpanded}>
				{Icon && (
					<IconContainer>
						<Icon />
					</IconContainer>
				)}
				<TitleContainer>{title}</TitleContainer>
			</AccordionSummary>
			<AccordionDetails>
				{children}
			</AccordionDetails>
		</MuiAccordion>
	);
};
