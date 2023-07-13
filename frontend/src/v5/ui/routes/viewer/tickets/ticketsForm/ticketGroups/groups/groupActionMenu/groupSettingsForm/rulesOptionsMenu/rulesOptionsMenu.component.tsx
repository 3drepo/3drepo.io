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
import { GroupRuleSchema } from '@/v5/validation/groupSchemes/groupSchemes';
import * as Yup from 'yup';
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { formatMessage } from '@/v5/services/intl';
import { Float } from './rulesOptionsMenu.styles';
import { EllipsisMenuItemDelete } from '../../../../../properties/ticketImageContent/ticketImageAction/ticketImageAction.styles';
import { prepareRuleForForm } from '../../../groupRulesForm/groupRulesForm.helpers';

export const RulesOptionsMenu = ({ value: rules, onClear, onPaste }) => {
	const handlePaste = async () => {
		try {
			const [clipboardItem] = await (navigator.clipboard as unknown as any).read();
			const blob = await clipboardItem.getType('text/plain');
			const newRules = JSON.parse(await blob.text());

			const sanitizedRules = newRules.map(({ id, ...rest }) => rest);
			Yup.array(GroupRuleSchema).min(1).validateSync(sanitizedRules.map(prepareRuleForForm));
			onPaste(sanitizedRules);
		} catch (error) {
			DialogsActionsDispatchers.open('alert', {
				currentActions: formatMessage({
					id: 'tickets.groups.newGroupForm.rules.options.error',
					defaultMessage: 'trying to paste the filters',
				}),
				error,
			});
		}
	};

	return (
		<Float>
			<EllipsisMenu>
				<CopyToClipboard text={JSON.stringify(rules)}>
					<EllipsisMenuItem
						title={(<FormattedMessage id="tickets.groups.newGroupForm.rules.options.copy" defaultMessage="Copy filters" />)}
						hidden={!rules.length}
					/>
				</CopyToClipboard>
				<EllipsisMenuItem
					title={(<FormattedMessage id="tickets.groups.newGroupForm.rules.options.paste" defaultMessage="Paste filters" />)}
					onClick={handlePaste}
				/>
				<EllipsisMenuItemDelete
					title={(<FormattedMessage id="tickets.groups.newGroupForm.rules.options.clear" defaultMessage="Clear All" />)}
					onClick={onClear}
					hidden={!rules.length}
				/>
			</EllipsisMenu>
		</Float>
	);
};
