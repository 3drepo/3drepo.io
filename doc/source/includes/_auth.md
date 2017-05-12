# Authentication

## Login

> Example Request

```http
POST /login HTTP/1.1
```


```json
{
	"username": "repoman",
	"password": "1984fantasy"
}
```

> Example Responses


```http
HTTP/1.1 200 OK
set-cookie:connect.sid=12345678901234567890; 

```

```json
{
	"username": "repoman"
}
```

### POST /login

All 3D Repo APIs use cookie-based authentication. To authenicate subsequent API calls
simply put 

`Cookie: connect.sid=123456`

in your HTTP Header

To generate a token and used it in cookie-based authentication, you need to
post user information to this API

### Request Attributes

Attribute | Required
--------- | ------- 
username | Yes
password | Yes 

<aside class="notice">
If you use modern browser's XMLHttpRequest object to make API calls, you
don't need to take care of the authenication process after calling to /login
</aside>

## Get current username

> Example Request

```http
GET /login HTTP/1.1
```

> Example Responses

```json
{
	"username": "repoman"
}
```

### GET /login

Get the username of the logged in user.


## Logout

> Example Request

```http
POST /logout HTTP/1.1
```

```json
{}
```

> Example Responses

```json
{
	"username": "repoman"
}
```

### POST /logout

Invalidate the token.