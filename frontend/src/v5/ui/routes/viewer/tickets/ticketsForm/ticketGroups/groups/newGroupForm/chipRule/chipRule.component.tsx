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
import CrossIcon from '@assets/icons/outlined/close-outlined.svg';
import { useState } from 'react';
import { IRule, OPERATION_DISPLAY_NAMES } from '../../groupRulesForm/groupRulesForm.helpers';
import { GroupRulesForm } from '../../groupRulesForm/groupRulesForm.component';
import { ChipWrapper, RuleActionMenu, RuleChip } from './chipRule.styles';

type ChipRuleProps = {
	value: IRule,
	onChange?: (rule: IRule) => void;
	onDelete: () => void;
};
export const ChipRule = ({ value: rule, onChange, onDelete }: ChipRuleProps) => {
	const [isSelected, setIsSelected] = useState(false);

	return (
		<RuleActionMenu
			onOpen={() => setIsSelected(true)}
			onClose={() => setIsSelected(false)}
			TriggerButton={(
				<ChipWrapper>
					<RuleChip
						label={(
							<>
								{rule.field} {OPERATION_DISPLAY_NAMES[rule.operation]}
								{!!rule.values?.length && (<b>&nbsp;{rule.values.join()}</b>)}
							</>
						)}
						deleteIcon={<div><CrossIcon /></div>}
						onDelete={onDelete}
						$selected={isSelected}
					/>
				</ChipWrapper>
			)}
		>
			<GroupRulesForm rule={rule} onSave={onChange} />
		</RuleActionMenu>
	)
};
