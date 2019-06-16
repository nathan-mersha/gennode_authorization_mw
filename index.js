/**
 * @name                - Gennode Authorization Middleware
 * @description         - Middle ware for gennode authorization service
 * @param req           - Request Object
 * @param res           - Response Object
 * @param next          - Next
 */


class GennodeAuthorizationMiddleware {

    /**
     * @name                    - Constructor
     * @description             - Gennode authorization middleware constructor
     * @param userConfig        - User configuration
     * @example
     * {
            authEndPoint    : "http://localhost:3400/auth/token/validate",
            message         : {
                authorized      : "Access Granted", // Code 401
                notAuthorized   : "Access Denied"   // Code 200
            },
            accessObject    : {
                body : ["_id","id"],
                url  : ["_id","id"]
            }
        }
     */
    constructor(userConfig){

        this.async      = require('async');
        this.debug      = require('debug')('Gennode-Authorization-Middleware');
        this.request    = require('request');
        this.xtend      = require('xtend');
        this.errorCodes = require('./lib/constant').errorCodes;

        // Define default configuration
        this.defaultConfig = {
            authEndPoint    : "http://localhost:3400/auth/token/validate",
            message         : {
                authorized      : "Access Granted", // Code 401
                notAuthorized   : "Access Denied"   // Code 200
            },
            getAccessObject : this.getAccessObject,
            getToken        : this.getToken,
        };

        // Sample request object to test func() return value.
        const sampleRequest = {
            query   : {_id : "someId"},
            params  : {_id : "someId"},
            get     : function (requestedHeader) {
                if(requestedHeader === "Authorization"){
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
        mergedConfig.message = this.xtend(defaultConfig.message, userConfig.message);
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

        let token = req.get("Authorization").split(" ");
        let errMsg = this.errorCodes.AUT.AUTHENTICATION_TYPE_NOT_ACCORD;

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

    /**
     * @name                    - Authorize
     * @description             - Parses body for authorization service and analyzes response.
     * @param req               - Request object
     * @param res               - Response object
     * @param next              - Next
     */
    authorize(req,res,next){

        let authorizeBody = {
            route       : req.url,
            method      : req.method,
            body        : req.body,
            objectId    : this.mergedConfig.getAccessObject(req),
            token       : this.mergedConfig.getToken(req, res)
        };


    }


}



module.exports = GennodeAuthorizationMiddleware;

