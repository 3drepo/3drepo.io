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
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import styled from 'styled-components';

import { COLOR } from '../../../../styles';

export const ModelInfo = styled.p`
	color: ${COLOR.BLACK_40};
	margin: 0 0 4px;
	font-size: 14px;
`;

export const FileName = styled(ModelInfo)`
	display: flex;
	align-items: center;
	margin-right: 8px;

	svg {
		margin-right: 8px;
	}
`;

export const StyledDialogActions = styled(DialogActions)`
	&& {
		margin: 0;
	}
`;

export const CancelButton = styled(Button)`
	&& {
		margin: 0 4px 0 0;
	}
`;

export const Main = styled.div`
	text-align: center;
`;

export const Additional = styled.p`
	text-align: center;
`;

export const FileContainer = styled.div`
	display: flex;
	margin-top: 12px;
`;

export const CheckboxContainer = styled(FormControlLabel)`
	&& {
		display: flex;
		height: 30px;
		margin-left: 0;

		& > span {
			padding-left: 0;
		}
	}
`;
