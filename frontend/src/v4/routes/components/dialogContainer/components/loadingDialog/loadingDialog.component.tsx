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
import { FunctionComponent } from 'react';
import DialogContent from '@mui/material/DialogContent';
import { Loader } from '../../../loader/loader.component';
import { LoaderContainer } from './loadingDialog.styles';

interface IProps {
	content?: string;
	children?: any;
}

export const LoadingDialog: FunctionComponent<IProps> = (props) => {
	return (
		<>
			<DialogContent>
				<LoaderContainer>
					<Loader content={props.content || props.children} />
				</LoaderContainer>
			</DialogContent>
		</>
	);
};
