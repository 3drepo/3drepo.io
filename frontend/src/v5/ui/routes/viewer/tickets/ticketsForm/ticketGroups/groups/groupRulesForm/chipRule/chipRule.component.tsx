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
import { IGroupRule } from '@/v5/store/tickets/tickets.types';
import { formatOperationLabel } from '../groupRulesForm.helpers';
import { ChipWrapper, RuleChip } from './chipRule.styles';

type ChipRuleProps = {
	value: IGroupRule,
	isSelected: boolean;
	onClick?: () => void;
	onDelete: () => void;
	disabled?: boolean;
};
export const ChipRule = ({ value: rule, isSelected, disabled, onDelete, onClick }: ChipRuleProps) => (
	<ChipWrapper>
		<RuleChip
			label={formatOperationLabel(rule)}
			disabled={disabled}
			onClick={onClick}
			onDelete={disabled ? null : onDelete}
			$selected={isSelected}
		/>
	</ChipWrapper>
);
