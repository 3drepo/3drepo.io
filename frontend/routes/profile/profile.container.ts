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

import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { connect, addRouting } from '../../helpers/migration';

import { Profile } from './profile.component';
import { TeamspaceActions, selectCurrentUser, selectIsAvatarPending } from '../../modules/teamspace';

const mapStateToProps = createStructuredSelector({
	currentUser: selectCurrentUser,
	isAvatarPending: selectIsAvatarPending
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	onAvatarChange: TeamspaceActions.uploadAvatar,
	onUserDataChange: TeamspaceActions.updateUser,
	onPasswordChange: TeamspaceActions.updateUserPassword
}, dispatch);

export default addRouting(connect(mapStateToProps, mapDispatchToProps)(Profile));
