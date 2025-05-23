'use strict';

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

const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru();

const checkPermission = proxyquire('../../../../src/v4/middlewares/checkPermissions', {
	'./getPermissionsAdapter': {},
	'../response_codes': {},
}).checkPermissionsHelper;

describe('Check permission function', () => {
	describe('should return true if user has enough permissions', () => {
		it('case #1 - requests nothing', () => {
			function getPermissionsAdpater() {
				return {
					accountLevel: () => Promise.resolve(['create_project']),
					projectLevel: () => Promise.resolve([]),
					modelLevel: () => Promise.resolve([]),
				};
			}

			return checkPermission('', '', '', '', [], getPermissionsAdpater).then((res) => {
				expect(res.granted).to.be.true;
			});
		});

		it('case #2 - account level permissions', () => {
			function getPermissionsAdpater() {
				return {
					accountLevel: () => Promise.resolve(['create_project']),
					projectLevel: () => Promise.resolve([]),
					modelLevel: () => Promise.resolve([]),
				};
			}

			return checkPermission('', '', '', '', ['create_project'], getPermissionsAdpater).then((res) => {
				expect(res.granted).to.be.true;
			});
		});

		it('case #3 - account level permissions', () => {
			function getPermissionsAdpater() {
				return {
					accountLevel: () => Promise.resolve(['create_project', 'assign_licence', 'create_role']),
					projectLevel: () => Promise.resolve([]),
					modelLevel: () => Promise.resolve([]),
				};
			}

			return checkPermission('', '', '', '', ['create_project', 'assign_licence'], getPermissionsAdpater).then((res) => {
				expect(res.granted).to.be.true;
			});
		});

		it('case #3.1 - account level permissions with OR relationship', () => {
			function getPermissionsAdpater() {
				return {
					accountLevel: () => Promise.resolve(['create_project']),
					projectLevel: () => Promise.resolve([]),
					modelLevel: () => Promise.resolve([]),
				};
			}

			return checkPermission('', '', '', '', { $or: [['assign_licence'], ['create_project']] }, getPermissionsAdpater).then((res) => {
				expect(res.granted).to.be.true;
			});
		});

		it('case #4 - project level permissions', () => {
			function getPermissionsAdpater() {
				return {
					accountLevel: () => Promise.resolve(['create_project', 'assign_licence', 'create_role']),
					projectLevel: () => Promise.resolve(['create_model', 'create_federation', 'delete_project']),
					modelLevel: () => Promise.resolve([]),
				};
			}

			return checkPermission('', '', '', '', ['create_model'], getPermissionsAdpater).then((res) => {
				expect(res.granted).to.be.true;
			});
		});

		it('case #5 - project level permissions', () => {
			function getPermissionsAdpater() {
				return {
					accountLevel: () => Promise.resolve(['create_project', 'assign_licence', 'create_role']),
					projectLevel: () => Promise.resolve(['create_model', 'create_federation', 'delete_project']),
					modelLevel: () => Promise.resolve([]),
				};
			}

			return checkPermission('', '', '', '', ['create_model', 'create_federation'], getPermissionsAdpater).then((res) => {
				expect(res.granted).to.be.true;
			});
		});

		it('case #5.1 - project level permissions with OR relationship', () => {
			function getPermissionsAdpater() {
				return {
					accountLevel: () => Promise.resolve(['create_project', 'assign_licence', 'create_role']),
					projectLevel: () => Promise.resolve(['create_federation', 'delete_project']),
					modelLevel: () => Promise.resolve([]),
				};
			}

			return checkPermission('', '', '', '', { $or: [['create_model'], ['create_federation', 'delete_project']] }, getPermissionsAdpater).then((res) => {
				expect(res.granted).to.be.true;
			});
		});

		it('case #6 - model level permissions', () => {
			function getPermissionsAdpater() {
				return {
					accountLevel: () => Promise.resolve(['create_project', 'assign_licence', 'create_role']),
					projectLevel: () => Promise.resolve(['create_model', 'create_federation', 'delete_project']),
					modelLevel: () => Promise.resolve(['view_issue', 'view_model', 'comment_issue']),
				};
			}

			return checkPermission('', '', '', '', ['view_issue'], getPermissionsAdpater).then((res) => {
				expect(res.granted).to.be.true;
			});
		});

		it('case #7 - model level permissions', () => {
			function getPermissionsAdpater() {
				return {
					accountLevel: () => Promise.resolve(['create_project', 'assign_licence', 'create_role']),
					projectLevel: () => Promise.resolve(['create_model', 'create_federation', 'delete_project']),
					modelLevel: () => Promise.resolve(['view_issue', 'view_model', 'comment_issue']),
				};
			}

			return checkPermission('', '', '', '', ['view_issue', 'view_model'], getPermissionsAdpater).then((res) => {
				expect(res.granted).to.be.true;
			});
		});

		it('case #7.1 - model level permissions with OR relationship', () => {
			function getPermissionsAdpater() {
				return {
					accountLevel: () => Promise.resolve(['create_project', 'assign_licence', 'create_role']),
					projectLevel: () => Promise.resolve(['create_model', 'create_federation', 'delete_project']),
					modelLevel: () => Promise.resolve(['view_issue', 'view_model']),
				};
			}

			return checkPermission('', '', '', '', { $or: [['comment_issue'], ['view_issue', 'view_model']] }, getPermissionsAdpater).then((res) => {
				expect(res.granted).to.be.true;
			});
		});

		it('case #8 - mixed level permissions', () => {
			function getPermissionsAdpater() {
				return {
					accountLevel: () => Promise.resolve(['create_project', 'assign_licence', 'create_role']),
					projectLevel: () => Promise.resolve(['create_model', 'create_federation', 'delete_project']),
					modelLevel: () => Promise.resolve(['view_issue', 'view_model', 'comment_issue']),
				};
			}

			return checkPermission('', '', '', '', ['create_project', 'create_model', 'view_issue'], getPermissionsAdpater).then((res) => {
				expect(res.granted).to.be.true;
			});
		});

		it('case #8.1 - mixed level permissions with OR relationship', () => {
			function getPermissionsAdpater() {
				return {
					accountLevel: () => Promise.resolve(['create_project', 'assign_licence', 'create_role']),
					projectLevel: () => Promise.resolve(['create_model', 'create_federation', 'delete_project']),
					modelLevel: () => Promise.resolve(['view_issue', 'view_model', 'comment_issue']),
				};
			}

			return checkPermission('', '', '', '', { $or: [['revoke_licence'], ['create_project', 'create_model', 'view_issue']] }, getPermissionsAdpater).then((res) => {
				expect(res.granted).to.be.true;
			});
		});
	});

	describe("should return false if user doesn't have enough permissions", () => {
		it('case #1 - no permissions assiged to user', () => {
			function getPermissionsAdpater() {
				return {
					accountLevel: () => Promise.resolve([]),
					projectLevel: () => Promise.resolve([]),
					modelLevel: () => Promise.resolve([]),
				};
			}

			return checkPermission('', '', '', '', ['create_project'], getPermissionsAdpater).then((res) => {
				expect(res.granted).to.be.false;
			});
		});

		it('case #2 - insufficient account permissions', () => {
			function getPermissionsAdpater() {
				return {
					accountLevel: () => Promise.resolve(['assign_licence']),
					projectLevel: () => Promise.resolve([]),
					modelLevel: () => Promise.resolve([]),
				};
			}

			return checkPermission('', '', '', '', ['create_project'], getPermissionsAdpater).then((res) => {
				expect(res.granted).to.be.false;
			});
		});

		it('case #3 - insufficient project permissions', () => {
			function getPermissionsAdpater() {
				return {
					accountLevel: () => Promise.resolve(['assign_licence']),
					projectLevel: () => Promise.resolve(['create_model', 'create_federation']),
					modelLevel: () => Promise.resolve([]),
				};
			}

			return checkPermission('', '', '', '', ['create_model', 'delete_project'], getPermissionsAdpater).then((res) => {
				expect(res.granted).to.be.false;
			});
		});

		it('case #4  - insufficient permissions on just one level', () => {
			function getPermissionsAdpater() {
				return {
					accountLevel: () => Promise.resolve(['create_project', 'assign_licence', 'create_role']),
					projectLevel: () => Promise.resolve(['create_model', 'create_federation', 'delete_project']),
					modelLevel: () => Promise.resolve(['view_issue', 'view_model']),
				};
			}

			return checkPermission('', '', '', '', ['create_project', 'create_model', 'view_issue', 'comment_issue'], getPermissionsAdpater).then((res) => {
				expect(res.granted).to.be.false;
			});
		});

		it('case #4  - insufficient permissions with OR relationship', () => {
			function getPermissionsAdpater() {
				return {
					accountLevel: () => Promise.resolve(['create_project', 'assign_licence', 'create_role']),
					projectLevel: () => Promise.resolve(['create_federation', 'delete_project']),
					modelLevel: () => Promise.resolve(['view_issue', 'view_model']),
				};
			}

			return checkPermission('', '', '', '', [['create_project', 'create_model'], ['view_issue', 'comment_issue']], getPermissionsAdpater).then((res) => {
				expect(res.granted).to.be.false;
			});
		});
	});

	describe('should return true if user has teamspace admin permission', () => {
		it('teamspace admin', () => {
			function getPermissionsAdpater() {
				return {
					accountLevel: () => Promise.resolve(['teamspace_admin']),
					projectLevel: () => Promise.resolve([]),
					modelLevel: () => Promise.resolve([]),
				};
			}

			return checkPermission('', '', '', '', ['create_project', 'create_model', 'view_issue', 'comment_issue'], getPermissionsAdpater).then((res) => {
				expect(res.granted).to.be.true;
			});
		});
	});
});
