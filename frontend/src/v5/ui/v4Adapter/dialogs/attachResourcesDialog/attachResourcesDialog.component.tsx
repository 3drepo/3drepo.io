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
import { DetailedHTMLProps, FormHTMLAttributes } from 'react';
import CloseIcon from '@assets/icons/close.svg';
import {
	Title,
	Header,
	CloseButton,
	FormDialogContent,
} from '@/v5/ui/controls/modal/formModal/formDialog.styles';
import { Container, Form } from './attachResourcesDialog.styles';

interface V5AttachResourcesDialogProps extends Omit<DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>, 'ref'> {
	onClickClose?: () => void;
	isValid?: boolean;
}

export const V5AttachResourcesDialog = ({
	onClickClose,
	children,
	...formProps
}: V5AttachResourcesDialogProps) => (
	<Container>
		<Form {...formProps}>
			<Header>
				<Title>Attach Resources</Title>
				<CloseButton aria-label="Close dialog" onClick={onClickClose}>
					<CloseIcon />
				</CloseButton>
			</Header>
			<FormDialogContent $zeromargin>
				{children}
			</FormDialogContent>
		</Form>
	</Container>
);
