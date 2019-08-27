/**
 * @author              - Nathan Mersha
 * @copyright           - August 2019
 * @name                - Gennode Authorization Middleware
 * @description         - Middle ware for gennode authorization service
 */


class GennodeAuthorizationMiddleware {

    /**
     * @name                    - Constructor
     * @description             - Gennode authorization middleware constructor
     * @param userConfig        - User configuration
     * @example
     * {
            host             : "localhost",
            service          : null,
            port             : 3400,
            endpoint         : "/auth/token/validate",
            connection       : "http", // http call, seneca // todo future seneca support
            message          : {
                authorized      : "Access Granted", // Code 401
                notAuthorized   : "Access Denied"   // Code 200
            },
            authorizationKey : "Authorization", // Defines the key name inside the request header.
            getAccessObject  : this.getAccessObject,
            getToken         : this.getToken
       }
     */
    constructor(userConfig){
        // Binding methods
        this.mergeConfig = this.mergeConfig.bind(this);
        this.sendRequest = this.sendRequest.bind(this);
        this.authorize = this.authorize.bind(this);
        this.getAccessObject = this.getAccessObject.bind(this);
        this.getToken = this.getToken.bind(this);

        this.async      = require('async');
        this.debug      = require('debug')('Gennode-Authorization-Middleware');
        this.request    = require('request');
        this.xtend      = require('xtend');
        this.exec       = require('child_process').exec;
        this.errorCodes = require('./lib/constant/errorCodes');

        // Define default configuration
        this.defaultConfig = {
            host    : "localhost",
            service : null,
            port    : 3400,
            endpoint : "/auth/token/validate",
            connection : "http", // http call, seneca // todo future seneca support
            message         : {
                notAuthorized   : "Access Denied"   // Code 401
            },
            authorizationKey : "Authorization", // Defines the key name inside the request header.
            getAccessObject : this.getAccessObject,
            getToken        : this.getToken
        };

        // Sample request object to test func() return value.
        const sampleRequest = {
            query   : {_id : "someId"},
            params  : {_id : "someId"},
            get     : (requestedHeader) =>{
                if(requestedHeader === this.mergedConfig.authorizationKey){
                    return "Bearer someTokenValues";
                }else{
                    return "something else";
                }
            }
        };

        // Merge default configuration with the user's configuration.
        this.mergedConfig = this.mergeConfig(this.defaultConfig,userConfig);

        // Check if the getAccessObject() function accepts an argument.
        if(this.mergedConfig.getAccessObject.length !== 1){
            throw new Error("getAccessObject() must be a function, with only one request argument.");
        }

        // Check if the getAccessObject() returns a value that is not undefined.
        if(this.mergedConfig.getAccessObject(sampleRequest) === undefined){
            throw new Error("getAccessObject() must be a function, with a return value that is not undefined.");
        }

        // Check if the getToken() function accepts an argument.
        if(this.mergedConfig.getToken.length !== 2){
            throw new Error("getToken() must be a function, with two arguments (req, res)");
        }

        // Check if the getToken() returns a value that is not undefined.
        if(this.mergedConfig.getToken(sampleRequest) === undefined){
            throw new Error("getToken() must be a function, with a return value that is not undefined.");
        }

        // ping authorization server and log status
        this.exec(`ping -c 3 ${this.mergedConfig.host.toString().replace("http://", "").replace("https://", "")}`, (error, stdout, stderr)=> {
            error || stderr ? this.debug(error, '\n\n', stderr, '\n', `Your authorization server may not be up at ${this.mergedConfig.host}`) : this.debug(stdout);
        });

        // Binding these methods after configuration merge is completed.
        this.getAccessObject = this.getAccessObject.bind(this);
        this.getToken = this.getToken.bind(this);

    }

    /**
     * @name                    - Merge Config
     * @description             - Merges default config with user config.
     * @param defaultConfig     - Default Configuration
     * @param userConfig        - Input user configuration
     * @returns {*}             - Merged Configuration
     */
    mergeConfig(defaultConfig, userConfig){
        let mergedConfig = this.xtend(defaultConfig, userConfig);
        // Make message merge config if user has provided config message values.
        if(userConfig !== undefined){
            mergedConfig.message = this.xtend(defaultConfig.message, userConfig.message);
        }
        return mergedConfig;
    }

    /**
     * @name                    - Get access object
     * @description             - Defines a function on how to retrieve the object id to RUD(read, update, delete)
     * @param req               - Request Object
     * @returns {*}             - Either _id on query on param. (Method could be overridden with any return method)
     */
    getAccessObject(req){
        return req.query._id !== undefined ? req.query._id : req.params._id !== undefined ? req.params._id : null;
    }

    /**
     * @name                    - Get token
     * @description             - Defines a function on how to retrieve token from the request, (Change function
     * reference in config, to change the logic on how to handle token retrieving process.
     * @param req               - Request Object
     * @param res               - Response Object
     * @returns *               - Token value
     */
    getToken(req, res){
        let errorCodes  = require('./lib/constant/errorCodes');
        // Checking if the request header contains the appropriate key word as defined by the configuration, default key word is
        if(! req.get(this.mergedConfig.authorizationKey)){
            let errMsg = errorCodes.AUT.AUTHENTICATION_TYPE_NOT_ACCORD;
            errMsg.detail = `Request header must contain an authorization key word : ${this.mergedConfig.authorizationKey}`;
            res.status(401);
            res.json(errMsg);
        }else{
            let
                token       = req.get(this.mergedConfig.authorizationKey).split(" "),
                errMsg      = errorCodes.AUT.AUTHENTICATION_TYPE_NOT_ACCORD;

            // Checking token type
            if(token[0] !== "Bearer"){
                errMsg.detail = "Token type must be 'Bearer'";
                res.status(401);
                res.json(errMsg);
            }

            // Checking token format
            if(token.length !== 2){
                errMsg.detail = "Token must have the format 'Bearer tokenValue' (Note : there is a space between the token type and the value)";
                res.status(401);
                res.json(errMsg);
            }
            return token[1]; // Return token value
        }
    }

    /**
     * @name                - Send request
     * @description         - Sends request
     * @param body          - Body to send
     * @param method        - Http Method
     * @param endPoint      - Endpoint
     * @param callback      - Callback function (error, response, body)
     */
    sendRequest(body, method, endPoint, callback){

        let options = option(method,body); // defines sending options
        this.request(endPoint,options,function (err,res,body) {
            callback(err,res,body)
        });

        /**
         * @name                - Option
         * @description         - Constructs option object
         * @param method        - Http Method
         * @param body          - Request body
         * @returns {{method: *, json: boolean, body: *}}
         */
        function option           (method,body)    {
            return {
                method : method, // defines the method PUT,GET,DELETE,REMOVE
                json : (body !== null), // defines true only when body data is available to attach
                body : body
            }
        }
    }

    /**
     * @name                    - Authorize
     * @description             - Parses body for authorization service and analyzes response.
     * @param req               - Request object
     * @param res               - Response object
     * @param next              - Next
     */
    authorize(req,res,next){
        let
            objectId = this.mergedConfig.getAccessObject(req),
            token    = this.mergedConfig.getToken(req,res);

        let body = {
            service     : this.mergedConfig.service,
            ip          : req.ip,
            params      : req.params,
            path        : req.path,
            query       : req.query,
            secure      : req.secure,
            xhr         : req.xhr,

            route       : req.url,
            method      : req.method,
            body        : !req.body ? null : req.body,
            objectId    : objectId,
            token       : token
        };

        if(token){ // Perform authorization request if token exists.
            let constructedEndpoint = `http://${this.mergedConfig.host}${this.mergedConfig.port ? `:${this.mergedConfig.port}` : ""}${this.mergedConfig.endpoint}`;
            this.sendRequest(body,"POST",constructedEndpoint,(error, response, body) =>{
                if(response.statusCode === 200){ // Request of the resource is authorized.
                    next();
                }else {
                    body.detail = this.mergedConfig.message.notAuthorized;
                    res.status(response.statusCode);
                    res.json(body);
                }
            });
        }
    }
}

module.exports = GennodeAuthorizationMiddleware;