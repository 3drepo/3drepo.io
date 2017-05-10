# Authentication

## Login

### POST /login

```plaintext
POST /login
```

> Example Request

```json
{
	"username": "repoman",
	"password": "1984"
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



## Logout

### POST /logout

```plaintext
POST /logout
```

> Example Request

```json
{}
```

> Example Responses

```json
{
	"username": "repoman"
}
```

Invalidate the token.