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
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks/projectsSelectors.hooks';
import { FormControl, FormHelperText } from '@mui/material';
import { ActionsList, ActionsSide, Container, Label } from './basicTicketImage.styles';
import { TicketImageDisplayer } from './ticketImageDisplayer/ticketImageDisplayer.component';

export type BasicTicketImageProps = {
	imgSrc: string,
	error?: any,
	helperText?: string,
	title: string,
	className?: string,
	onChange?: (imgSrc) => void,
	children: any,
	required?: boolean,
	disabled?: boolean,
	onEmptyImageClick: () => void,
};
export const BasicTicketImage = ({
	children,
	imgSrc,
	title,
	className,
	error,
	helperText,
	required,
	disabled,
	onEmptyImageClick,
}: BasicTicketImageProps) => {
	const { isAdmin } = ProjectsHooksSelectors.selectCurrentProjectDetails();

	return (
		<FormControl error={error} required={required}>
			<Container className={className} error={error}>
				<ActionsSide>
					<Label>{title}</Label>
					<ActionsList>{children}</ActionsList>
				</ActionsSide>
				<TicketImageDisplayer
					imgSrc={imgSrc}
					disabled={disabled || !isAdmin}
					onEmptyImageClick={onEmptyImageClick}
				/>
			</Container>
			<FormHelperText>{helperText}</FormHelperText>
		</FormControl>
	);
};
