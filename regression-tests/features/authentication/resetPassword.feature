#  Copyright (C) 2023 3D Repo Ltd
#
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU Affero General Public License as
#  published by the Free Software Foundation, either version 3 of the
#  License, or (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU Affero General Public License for more details.
#
#  You should have received a copy of the GNU Affero General Public License
#  along with this program.  If not, see <http://www.gnu.org/licenses/>.
Feature: Reset Password
	Scenario: From the login page, click on the link to forgot password
		Given I navigate to '/'
		When I click on 'Forgotten your password?'
		Then I should be redirected to the 'password-forgot' page

	Scenario: Complete forgot password flow with a valid username (non SSO)
		Given I request email for forgot password with:
			| Username or email |
  			| homerJSimpson     |
		And I reset the password from email 'homerJSimpson@mailinator.com' with new password 'Uq5a4axS(vc7nnG6'
		When I sign in with:
			| Username        | Password         |
  			| homerJSimpson   | Uq5a4axS(vc7nnG6 |
		Then I should be redirected to the 'dashboard' page
