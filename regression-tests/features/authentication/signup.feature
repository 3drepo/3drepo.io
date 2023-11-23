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

Feature: Signup
	Scenario: Sign up link
		Given Im not logged in
		And I navigate to '/'
		When I click on 'Sign up'
		Then I should be redirected to the 'signup' page

	Scenario: Sign up with valid properties
		Given Im not logged in
		Given I try to signup with:
			| Username  | Email            | Password        | First name  | Last name       |
  			| newuser   | newuser@mail.com | +jk+gnPZM^2LXDV | New         | User            |
		And I wait until "verify your email" text appears
		And I verify the account from email "newuser@mail.com"
		When I sign in with:
			| Username  | Password        |
  			| newuser   | +jk+gnPZM^2LXDV |
		Then I should be redirected to the 'dashboard' page

	Scenario: Sign up (username taken)
		Given Im not logged in
		# I try to signup with same username different email
		Given I try to signup with:
			| Username  | Email             | Password        | First name  | Last name       |
  			| newuser   | newuser2@mail.com | +jk+gnPZM^2LXDV | New         | User            | 
		Then I wait until "This username is already taken" text appears

	Scenario: Sign up (email taken)
		Given Im not logged in
		# I try to signup with same email different username
		Given I try to signup with:
			| Username  | Email             | Password        | First name  | Last name       |
  			| newuser2   | newuser@mail.com | +jk+gnPZM^2LXDV | New         | User            |		
		Then I wait until "This email is already taken" text appears

	Scenario: Invalid parameters will show errors and invalidate the signup form
		Given Im not logged in		
		And I navigate to 'signup'
		And I fill in the form with:
			| Username  | Email             | Password |
  			| space guy | newusermail.com 	| pass     |
		Then I wait until "Username can only consist of letters" text appears
		And I wait until "Invalid email address" text appears
		And I wait until "Password must be at least 8 characters" text appears
		And button "Next step" should be disabled
