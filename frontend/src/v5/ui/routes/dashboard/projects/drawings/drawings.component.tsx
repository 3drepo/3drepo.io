/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { DialogsActionsDispatchers, DrawinsgActionDispatchers } from '@/v5/services/actionsDispatchers';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { DrawingHooksSelectors } from '@/v5/services/selectorsHooks';
import AddCircleIcon from '@assets/icons/filled/add_circle-filled.svg';
import { Button } from '@controls/button';
import { FormattedMessage } from 'react-intl';
import { CreateDrawingDialog } from './drawingDialogs/createDrawingDialog.component';
import { EditDrawingDialog } from './drawingDialogs/editDrawingDialog.component';



export const Drawings = () => {
	const { teamspace, project } = useParams<DashboardParams>();

	const isPending = DrawingHooksSelectors.selectIsListPending();
	const drawings = DrawingHooksSelectors.selectDrawings();

	useEffect(() => {
		if (!isPending) return;
		DrawinsgActionDispatchers.fetchDrawings(teamspace, project);
	}, [isPending]);

	const onClickCreate = () => DialogsActionsDispatchers.open(CreateDrawingDialog);
	const onClickEdit = (drawing) => DialogsActionsDispatchers.open(EditDrawingDialog, { drawing });

	return (<div>
		<h1>Drawings list</h1>
		{isPending ? 
			(<b>Loading...</b>) : 
			(
				<>
					<Button
						startIcon={<AddCircleIcon />}
						variant="outlined"
						color="secondary"
						onClick={onClickCreate}
					>
						<FormattedMessage id="drawings.newDrawing" defaultMessage="New drawing" />
					</Button>
					<ul>
						{drawings.map((drawing) => (<li>{drawing.name} <button onClick={() => onClickEdit(drawing)}>Edit</button></li>))} 
					</ul>
				</>

			)
		}
	</div>);
};