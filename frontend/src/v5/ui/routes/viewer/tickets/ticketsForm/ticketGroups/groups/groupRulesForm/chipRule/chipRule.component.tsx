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
import { Tooltip } from '@mui/material';
import { ChipWrapper, RuleChip } from './chipRule.styles';

type ChipRuleProps = {
	label: string,
	isSelected: boolean;
	onClick?: () => void;
	onDelete: () => void;
	isReadOnly?: boolean;
};
export const ChipRule = ({ label, isSelected, isReadOnly, onDelete, ...props }: ChipRuleProps) => (
	<Tooltip title={label}>
		<ChipWrapper>
			<RuleChip
				label={label}
				onDelete={isReadOnly ? null : onDelete}
				$selected={isSelected}
				{...props}
			/>
		</ChipWrapper>
	</Tooltip>
);
