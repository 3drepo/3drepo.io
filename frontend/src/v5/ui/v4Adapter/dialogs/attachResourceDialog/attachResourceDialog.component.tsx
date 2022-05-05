/**
 *  Copyright (C) 2019 3D Repo Ltd
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
import { DetailedHTMLProps, FormHTMLAttributes } from 'react';
import CloseIcon from '@assets/icons/close.svg';
import {
	Title,
	Header,
	CloseButton,
	FormDialogContent,
} from '@/v5/ui/controls/modal/formModal/formDialog.styles';
import {
	ScrollArea,
	Container,
	Form,
} from './attachResourceDialog.styles';

interface V5AttachResourcesDialogProps extends Omit<DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>, 'ref'> {
	onClickClose?: () => void;
	title?: string;
	isValid?: boolean;
}

export const V5AttachResourcesDialog = ({
	onClickClose,
	title,
	children,
	isValid = true,
	...formProps
}: V5AttachResourcesDialogProps) => (
	<Container>
		<Form {...formProps}>
			<Header>
				<Title>
					{title}
				</Title>
				<CloseButton aria-label="Close dialog" onClick={onClickClose}>
					<CloseIcon />
				</CloseButton>
			</Header>
			<ScrollArea variant="base" autoHeightMax="70vh" autoHeight>
				<FormDialogContent zeroMargin>
					{children}
				</FormDialogContent>
			</ScrollArea>
		</Form>
	</Container>
);
