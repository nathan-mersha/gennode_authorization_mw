/**
 * @name                Gennode Authorization Middleware
 * @description         Middle ware for gennode authorization service
 * @module              errorCodes.js
 * @kind                Constants
 * @copyright           June, 2019
 */

/**
 * @description     - Defines error codes.
 */
module.exports = {
    /**
     * @name            - Authentication error codes.
     * @description     - Defines a list of error codes that could be generated when communicating with authentication service.
     */
    AUT                 : {

        AUTHENTICATION_NOT_SET                  : {
            errorCode       : "AUT_000",
            errorName       : "Authentication is not set",
            errorMessage    : "Authentication values are not set.",
            hint            : "View documentation on how to set authentication values on the header."
        },

        AUTHENTICATION_DATA_NOT_PROPER_LENGTH   : {
            errorCode       : "AUT_001",
            errorName       : "Authentication data not proper length.",
            errorMessage    : "Authentication data does not contain proper length.",
            hint            : "View documentation on how to set authentication values on the header."
        },

        AUTHENTICATION_TYPE_NOT_ACCORD          : {
            errorCode       : "AUT_002",
            errorName       : "Authentication type is not correct.",
            errorMessage    : "Authentication type is not according to constants.",
            hint            : "Authentication type should be 'Bearer', view documentation for more."
        },

        AUTHENTICATION_VALUE_NOT_SET            : {
            errorCode       : "AUT_003",
            errorName       : "Authentication value is not set",
            errorMessage    : "Authentication values are not set.",
            hint            : "Authentication key exists, but value may not."
        }
    }

};
