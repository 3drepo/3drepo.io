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
import { PureComponent, SyntheticEvent, ComponentType } from 'react';
import { Tooltip } from '@mui/material';
import { TooltipProps } from '@mui/material/Tooltip';
import { renderWhenTrueOtherwise } from '../../../helpers/rendering';
import { SmallIconButtonStyled } from './smallIconButton.styles';

interface IProps {
	onClick?: (event: SyntheticEvent) => void;
	Icon: ComponentType;
	ariaLabel?: string;
	tooltip?: string;
	disabled?: boolean;
	tooltipPlacement?: TooltipProps['placement'];
}

export class SmallIconButton extends PureComponent<IProps, any> {
	public static defaultProps = {
		tooltipPlacement: 'bottom',
	};

	public renderButtonConditionally = renderWhenTrueOtherwise(() => (
		<Tooltip title={this.props.tooltip} placement={this.props.tooltipPlacement}>
			{this.renderButton()}
		</Tooltip>
	), () => this.renderButton());

	public renderButton = () => {
		const { Icon, ariaLabel, tooltip, onClick, disabled = false } = this.props;

		return (
			<SmallIconButtonStyled
				aria-label={ariaLabel || tooltip}
				onClick={onClick}
				disabled={disabled}
			>
				<Icon />
			</SmallIconButtonStyled>
		);
	}

	public render() {
		return this.renderButtonConditionally(this.props.tooltip);
	}
}
