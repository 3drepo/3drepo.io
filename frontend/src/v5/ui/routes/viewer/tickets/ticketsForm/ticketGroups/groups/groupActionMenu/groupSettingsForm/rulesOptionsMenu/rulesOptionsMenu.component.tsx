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

import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem';
import { FormattedMessage } from 'react-intl';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { EllipsisMenu } from '@controls/ellipsisMenu';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { Float } from './rulesOptionsMenu.styles';
import { EllipsisMenuItemDelete } from '../../../../../properties/ticketImageContent/ticketImageAction/ticketImageAction.styles';

export const RulesOptionsMenu = ({ value: rules, onClear, onPaste }) => {
	const isAdmin = !TicketsCardHooksSelectors.selectReadOnly();

	return (
		<Float>
			<EllipsisMenu>
				<CopyToClipboard text={JSON.stringify(rules.map(({ id, ...rest }) => rest))}>
					<EllipsisMenuItem
						title={(<FormattedMessage id="tickets.groups.newGroupForm.rules.options.copy" defaultMessage="Copy filters" />)}
						hidden={!rules.length}
					/>
				</CopyToClipboard>
				<EllipsisMenuItem
					title={(<FormattedMessage id="tickets.groups.newGroupForm.rules.options.paste" defaultMessage="Paste filters" />)}
					onClick={onPaste}
					hidden={!isAdmin}
				/>
				<EllipsisMenuItemDelete
					title={(<FormattedMessage id="tickets.groups.newGroupForm.rules.options.clear" defaultMessage="Clear All" />)}
					onClick={onClear}
					hidden={!rules.length || !isAdmin}
				/>
			</EllipsisMenu>
		</Float>
	);
};
