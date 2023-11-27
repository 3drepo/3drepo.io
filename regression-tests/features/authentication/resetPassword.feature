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

	Scenario: Complete forgot password flow with a valid email (non SSO)
		Given I request email for forgot password with:
			| Username or email |
  			| homerJSimpson@mailinator.com     |
		And I reset the password from email 'homerJSimpson@mailinator.com' with new password 'c6UNLHPvBTX86Wa'
		When I sign in with:
			| Username        | Password        |
  			| homerJSimpson   | c6UNLHPvBTX86Wa |
		Then I should be redirected to the 'dashboard' page

	Scenario: Fill in the forgot password form with a non existent user
		Given I request email for forgot password with:
			| Username or email |
  			| nonexistentuser   |
		Then I wait until "A password change request has been sent" text appears
		And I shouldnt get email

	Scenario: Fill in the forgot password form with an email that is not registered with 3drepo
		Given I request email for forgot password with:
			| Username or email        |
  			| nonexistentuser@mail.com |
		Then I wait until "A password change request has been sent" text appears
		And I shouldnt get email

	Scenario: Fill in the forgot password form with a valid username (non SSO) with randomised case
		Given I request email for forgot password with:
			| Username or email |
  			| HOMerjsImpsOn     |
		Then I wait until "A password change request has been sent" text appears
		And I shouldnt get email

	Scenario: Complete forgot password flow with a valid email but with varied case (non SSO)
		Given I request email for forgot password with:
			| Username or email            |
  			| HOMERjSiMPson@mailinator.com |
		And I reset the password from email 'homerJSimpson@mailinator.com' with new password 'TqE4ckT1wJk9WQZ'
		When I sign in with:
			| Username        | Password        |
  			| homerJSimpson   | TqE4ckT1wJk9WQZ |
		Then I should be redirected to the 'dashboard' page
