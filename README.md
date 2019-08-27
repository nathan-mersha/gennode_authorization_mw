# GenNode Authorization Middleware

#### Author
Nathan Mersha

### Installation

Gennode authorization middleware is available on npm, type:

`$ npm i gennode_authorization_mw`


### Description
This module is a middleware to be plugged in your server as described [here](https://www.npmjs.com/package/gennode_authorization) and so the middleware is a supporting library
to be used along with the other 2 libraries in the cluster. The main function of the middleware is to parse and send request to **GenNode Authorization** server and either responds
with 401 (unAuthorized) or 200(Authorized) response.

### How to use it

###### 1. Initialize the middleware with a constructor

```javascript
let GennodeAuthMW = require('gennode_authorization_mw');
let GennodeAuthMWInstance = new GennodeAuthMW({
        host    : "localhost",
        service : "Service name",
        port    : 3400,
        endpoint : "/auth/token/validate",
        connection : "http", // http call, seneca // future seneca support
        message         : {
            notAuthorized   : "Access Denied"   // Code 401
        },
        authorizationKey : "Authorization", // Defines the key name inside the request header.
        getAccessObject : this.getAccessObject,
        getToken        : this.getToken
    });
```

| Configuration | Description | Default |
|:------------:|:-----------:|:-----------:|
|host               |Gennode Authorization service host | localhost |
|service            |Service name | null |
|port               |Gennode Authorization port         | 3400 |
|endpoint           |Token validator endpoint           | /auth/token/validate |
|connection         |Communication type (Current support : http) for future seneca support | http |
|message            |Message for un-authorized responses ( For access granted the middleware calls next(), no need for message| Access Denied |
|authorizationKey   |Authorization key on the header          | Authorization |
|getAccessObject    |A function that returns the access object id from the request (Can be overridden)           | ()=> return req.query._id !== undefined ? req.query._id : req.params._id !== undefined ? req.params._id : null; |
|getToken           |A function that returns the token value from the request (Can be overridden)          | Returns the token value from the 'Bearer tokenValue' by the authorization key from the header|


###### 2. Insert the middleware in your express application, like this :

```javascript
let express = require('express');
let app = express();

// Insert your middleware in to your express application
app.use(GennodeAuthMWInstance.authorize); // Now every request will pass through the gennode_authorization_service


```

### Contributing
**If you have anything in mind, that you think is would be awesome to include in the generated server files, feel free to create an issue [here](https://github.com/nathan-mersha/gennode_authorization_mw), 
or fork the project.**
