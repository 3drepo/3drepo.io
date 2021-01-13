/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import Tooltip from '@material-ui/core/Tooltip';
import { TooltipProps } from '@material-ui/core/Tooltip';
import React from 'react';
import { StyledIconButton } from './tooltipButton.styles';

interface IProps {
	label: string;
	Icon: React.ComponentType;
	color?: string;
	disabled?: boolean;
	className?: string;
	active?: boolean;
	placement?: TooltipProps['placement'];
	disableFocusListener?: TooltipProps['disableFocusListener'];
	action?: (event) => void;
	onClick?: (event) => void;
	id?: string;
}

export const TooltipButton = (props: IProps) => {
	const {
		label,
		action = null,
		onClick = null,
		Icon,
		color = 'inherit',
		disabled = false,
		className,
		active = false,
		placement,
		disableFocusListener
	} = props;
	const iconProps = { color, fontSize: 'small' } as any;

	const renderButton = () => (
		<StyledIconButton id={props.id}
			aria-label={label}
			onClick={onClick || action}
			disabled={disabled}
			className={className}
			active={Number(active)}
		>
			<Icon {...iconProps} />
		</StyledIconButton>
	);

	return (
		<>
			{ disabled ?
				renderButton() :
					<Tooltip
							title={label}
							disableHoverListener={disabled}
							placement={placement}
							disableFocusListener={disableFocusListener}
					>
					<span>
						{renderButton()}
					</span>
				</Tooltip>
			}
		</>
	);
};
