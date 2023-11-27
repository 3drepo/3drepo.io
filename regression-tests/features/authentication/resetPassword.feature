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
	Scenario: Forgot Password link
		Given I navigate to '/'
		When I click on 'Forgotten your password?'
		Then I should be redirected to the 'password-forgot' page

	Scenario: Reset password of existing user
		Given I request email for forgot password with:
			| Username or email |
  			| homerJSimpson     |
		And I reset the password from email 'homerJSimpson@mailinator.com' with new password 'Uq5a4axS(vc7nnG6'
		When I sign in with:
			| Username        | Password         |
  			| homerJSimpson   | Uq5a4axS(vc7nnG6 |
		Then I should be redirected to the 'dashboard' page

	Scenario: Reset password of existing user (email)
		Given I request email for forgot password with:
			| Username or email |
  			| homerJSimpson@mailinator.com     |
		And I reset the password from email 'homerJSimpson@mailinator.com' with new password 'c6UNLHPvBTX86Wa'
		When I sign in with:
			| Username        | Password        |
  			| homerJSimpson   | c6UNLHPvBTX86Wa |
		Then I should be redirected to the 'dashboard' page

	Scenario: Reset password of invalid user
		Given I request email for forgot password with:
			| Username or email |
  			| nonexistentuser   |
		Then I wait until "A password change request has been sent" text appears
		And I shouldnt get email

	Scenario: Reset password of invalid user (email)
		Given I request email for forgot password with:
			| Username or email        |
  			| nonexistentuser@mail.com |
		Then I wait until "A password change request has been sent" text appears
		And I shouldnt get email

	Scenario: Reset password of existing username (case)
		Given I request email for forgot password with:
			| Username or email |
  			| HOMerjsImpsOn     |
		Then I wait until "A password change request has been sent" text appears
		And I shouldnt get email

	Scenario: Reset password of existing user (email) (case)
		Given I request email for forgot password with:
			| Username or email            |
  			| HOMERjSiMPson@mailinator.com |
		And I reset the password from email 'homerJSimpson@mailinator.com' with new password 'TqE4ckT1wJk9WQZ'
		When I sign in with:
			| Username        | Password        |
  			| homerJSimpson   | TqE4ckT1wJk9WQZ |
		Then I should be redirected to the 'dashboard' page
