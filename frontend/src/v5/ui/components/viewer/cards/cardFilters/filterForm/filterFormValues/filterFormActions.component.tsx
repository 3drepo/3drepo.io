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

import { FormattedMessage } from 'react-intl';
import { ActionMenuItem } from '@controls/actionMenu';
import { ButtonsContainer, Button } from '../filterForm.styles';

type FilterFormActionsProps = {
	canSubmit: boolean,
	cancelButton?: boolean,
	onCancel: () => void,
	onSubmit: any,
};

export const FilterFormActions = ({ canSubmit, cancelButton, onCancel, onSubmit }: FilterFormActionsProps) => (
	<ButtonsContainer>
		<Button onClick={onCancel} color="secondary">
			{cancelButton
				? <FormattedMessage id="viewer.card.tickets.filters.form.cancel" defaultMessage="Cancel" />
				: <FormattedMessage id="viewer.card.tickets.filters.form.back" defaultMessage="Back" />
			}
		</Button>
		<ActionMenuItem disabled={!canSubmit}>
			<Button onClick={onSubmit} color="primary" variant="contained" disabled={!canSubmit}>
				{cancelButton
					? <FormattedMessage id="viewer.card.tickets.filters.form.update" defaultMessage="Update" />
					: <FormattedMessage id="viewer.card.tickets.filters.form.apply" defaultMessage="Apply" />
				}
			</Button>
		</ActionMenuItem>
	</ButtonsContainer>
);
