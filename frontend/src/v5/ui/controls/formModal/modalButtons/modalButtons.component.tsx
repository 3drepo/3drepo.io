/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { FormattedMessage } from 'react-intl';
import { CancelButton, SubmitButton } from './modalButtons.styles';

type ModalCancelButtonProps = {
	children?: any;
	onClick: () => void;
	disabled?: boolean;
};
export const ModalCancelButton = ({ children, ...props }: ModalCancelButtonProps) => (
	<CancelButton {...props}>
		{children || <FormattedMessage id="formModal.actions.cancel" defaultMessage="Cancel" />}
	</CancelButton>
);

type ModalSubmitButtonProps = {
	children?: any;
	onClick: (event) => void;
	disabled?: boolean;
	isPending?: boolean;
};
export const ModalSubmitButton = ({ children, ...props }: ModalSubmitButtonProps) => (
	<SubmitButton {...props}>
		{children || <FormattedMessage id="formModal.actions.ok" defaultMessage="OK" />}
	</SubmitButton>
);
