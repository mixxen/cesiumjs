/*global define*/
define([
        './defined',
        './DeveloperError'
    ], function(
        defined,
        DeveloperError) {
    "use strict";
    /*global TextDecoder*/

    /**
     * @private
     */
    var getStringFromTypedArray = function(buffer, byteOffset, length) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(buffer)) {
            throw new DeveloperError('buffer is required.');
        }

        if (!defined(byteOffset)) {
            throw new DeveloperError('byteOffset is required.');
        }

        if (!defined(length)) {
            throw new DeveloperError('length is required.');
        }
        //>>includeEnd('debug');

        return getStringFromTypedArray.decode(new Uint8Array(buffer, byteOffset, length));
    };

    // Exposed functions for testing
    getStringFromTypedArray.decodeWithTextDecoder = function(view) {
        var decoder = new TextDecoder('utf-8');
        return decoder.decode(view);
    };

    getStringFromTypedArray.decodeWithFromCharCode = function(view) {
        var result = '';
        var length = view.length;

        // Convert one character at a time to avoid stack overflow on iPad.
        //
        // fromCharCode will not handle all legal Unicode values (up to 21 bits).  See
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCharCode
        for (var i = 0; i < length; ++i) {
          result += String.fromCharCode(view[i]);
        }
        return result;
    };

    if (typeof TextDecoder !== 'undefined') {
        getStringFromTypedArray.decode = getStringFromTypedArray.decodeWithTextDecoder;
    } else {
        getStringFromTypedArray.decode = getStringFromTypedArray.decodeWithFromCharCode;
    }

    return getStringFromTypedArray;
});
