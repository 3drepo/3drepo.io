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

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import {
	selectIsModelUploading,
	selectIsPending,
	selectRevisions,
	selectSettings,
	ModelActions,
} from '../../../../modules/model';
import { selectModels } from '../../../../modules/teamspaces';
import { UploadModelFileDialog } from './uploadModelFileDialog.component';

const mapStateToProps = createStructuredSelector({
	modelSettings: selectSettings,
	revisions: selectRevisions,
	isPending: selectIsPending,
	isModelUploading: selectIsModelUploading,
	models: selectModels,
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	fetchModelSettings: ModelActions.fetchSettings,
	uploadModelFile: ModelActions.uploadModelFile,
	fetchRevisions: ModelActions.fetchRevisions
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UploadModelFileDialog));
