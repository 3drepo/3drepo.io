/**
 *  Copyright (C) 2020 3D Repo Ltd
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
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import Tooltip from '@material-ui/core/Tooltip';

import { renderWhenTrueOtherwise } from '../../../../helpers/rendering';
import { StreetView } from '../../../components/fontAwesomeIcon';
import { ContainedButton } from '../containedButton/containedButton.component';
import { Container as ButtonContainer } from '../pinButton/pinButton.styles';

interface IProps {
	onUpdate?: () => void;
	disabled?: boolean;
}

const UpdateViewpointButton: React.FC<IProps> = React.forwardRef(
	({ disabled, onUpdate, ...props }: IProps, ref: React.Ref<HTMLSpanElement>) => (
		<ButtonContainer ref={ref} {...props}>
			<ContainedButton
				onClick={onUpdate}
				icon={StreetView}
				disabled={disabled}
			>
				Update Viewpoint
			</ContainedButton>
		</ButtonContainer>
	)
);

export const ViewpointButton = ({ ...props }: IProps) => {
	return (
		<>
			{renderWhenTrueOtherwise(() => (
				<Tooltip title={`Sorry, You do not have enough permissions to do this.`}>
					<UpdateViewpointButton {...props} />
				</Tooltip>
			), () => (
				<UpdateViewpointButton {...props} />
			))(props.disabled)}
		</>
	);
};
