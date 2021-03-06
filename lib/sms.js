/*!
 * qcloudsms_js
 *
 * @module sms
 *
 */

"use strict";

/**
 * Module dependencies.
 * @ignore
 */

var url = require("url");
var util = require("./util");


/**
 * Module exports
 * @ignore
 */
exports.SmsSingleSender = SmsSingleSender;
exports.SmsMultiSender = SmsMultiSender;
exports.SmsStatusPuller = SmsStatusPuller;
exports.SmsMobileStatusPuller = SmsMobileStatusPuller;


/**
 * SmsSingleSender
 *
 * @param  {string}  appid  - sdk appid
 * @param  {string}  appkey - sdk appkey
 * @constructor
 */
function SmsSingleSender(appid, appkey) {
    this.appid = appid;
    this.appkey = appkey;
    this.url = "https://yun.tim.qq.com/v5/tlssmssvr/sendsms";
};

/**
 * Send single SMS message
 *
 * @param  {number}    msgType - SMS message type, Enum{0: normal SMS, 1: marketing SMS}
 * @param  {string}    nationCode - nation dialing code, e.g. China is 86, USA is 1
 * @param  {string}    phoneNumber - phone number
 * @param  {string}    msg - SMS message content
 * @param  {string}    extend - extend field, default is empty string
 * @param  {string}    ext - ext field, content will be returned by server as it is
 * @public
 */
SmsSingleSender.prototype.send = function(msgType, nationCode, phoneNumber, msg, extend, ext) {
    var reqUrl = url.parse(this.url);
    var random = util.getRandom();
    var now = util.getCurrentTime();
    var options = {
        host: reqUrl.host,
        path: reqUrl.path + "?sdkappid=" + this.appid + "&random=" + random,
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: {
            tel: {
                nationcode: nationCode + "",
                mobile: phoneNumber + ""
            },
            type: parseInt(msgType),
            msg: msg,
            sig: util.calculateSignature(this.appkey, random, now, [phoneNumber]),
            time: now,
            extend: !extend ? "" : extend + "",
            ext: !ext ? "" : ext + ""
        }
    };

    util.request(options);
};


/**
 * Send single SMS message with template paramters
 *
 * @param  {string}    nationCode - nation dialing code, e.g. China is 86, USA is 1
 * @param  {string}    phoneNumber - phone number
 * @param  {number}    templId - template id
 * @param  {array}     params - template parameters
 * @param  {string}    sign - SMS user sign
 * @param  {string}    extend - extend field, default is empty string
 * @param  {string}    ext - ext field, content will be returned by server as it is
 * @public
 */
SmsSingleSender.prototype.sendWithParam = function (nationCode, phoneNumber, templId, params, sign, extend, ext) {
    return new Promise((resolve, reject) => {
        const reqUrl = url.parse(this.url)
        const random = util.getRandom()
        const now = util.getCurrentTime()
        const options = {
            host: reqUrl.host,
            path: reqUrl.path + "?sdkappid=" + this.appid + "&random=" + random,
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: {
                tel: {
                    nationcode: nationCode + "",
                    mobile: phoneNumber + ""
                },
                sign,
                tpl_id: parseInt(templId),
                params,
                sig: util.calculateSignature(this.appkey, random, now, [phoneNumber]),
                time: now,
                extend: !extend ? "" : extend + "",
                ext: !ext ? "" : ext + ""
            }
        }

        util.request(options)
            .then((res) => {
                if (res.statusCode !== 200) throw Error(res)
                resolve(res)
            })
            .catch((err) => {
                reject(err)
            })
    })
};

/**
 * SmsMultiSender
 *
 * @param  {string}  appid  - sdk appid
 * @param  {string}  appkey - sdk appkey
 * @constructor
 */
function SmsMultiSender(appid, appkey) {
    this.appid = appid;
    this.appkey = appkey;
    this.url = "https://yun.tim.qq.com/v5/tlssmssvr/sendmultisms2";
};

/**
 * Send a SMS messages to multiple phones at once
 *
 * @param  {number}    number - SMS message type, Enum{0: normal SMS, 1: marketing SMS}
 * @param  {string}    nationCode - nation dialing code, e.g. China is 86, USA is 1
 * @param  {array}     phoneNumber - phone number array
 * @param  {string}    msg - SMS message content
 * @param  {string}    extend - extend field, default is empty string
 * @param  {string}    ext - ext field, content will be returned by server as it is
 * @public
 */
SmsMultiSender.prototype.send = function(msgType, nationCode, phoneNumbers, msg, extend,  ext) {
    // assert
    util.assert(Array.isArray(phoneNumbers), "parameter `phoneNumbers` must be an array");

    var reqUrl = url.parse(this.url);
    var random = util.getRandom();
    var now = util.getCurrentTime();
    var options = {
        host: reqUrl.host,
        path: reqUrl.path + "?sdkappid=" + this.appid + "&random=" + random,
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: {
            tel: phoneNumbers.map(function(pn) { return {nationcode: nationCode + "", mobile: pn + ""}; }),
            type: parseInt(msgType),
            msg: msg,
            sig: util.calculateSignature(this.appkey, random, now, phoneNumbers),
            time: now,
            extend: !extend ? "" : extend + "",
            ext: !ext ? "" : ext + ""
        }
    };

    util.request(options);
};

/**
 * Send a SMS messages with template parameters to multiple phones at once
 *
 * @param  {string}    nationCode - nation dialing code, e.g. China is 86, USA is 1
 * @param  {array}     phoneNumbers - multiple phone numbers
 * @param  {number}    templId - template id
 * @param  {array}     params - template parameters
 * @param  {string}    sign - SMS user sign
 * @param  {string}    extend - extend field, default is empty string
 * @param  {string}    ext - ext field, content will be returned by server as it is
 * @public
 */
SmsMultiSender.prototype.sendWithParam = function(nationCode, phoneNumbers, templId, params, sign, extend, ext) {
    // assert
    util.assert(Array.isArray(phoneNumbers), "parameter `phoneNumbers` must be an array");
    util.assert(Array.isArray(params), "parameter `params` must be an array");

    var reqUrl = url.parse(this.url);
    var random = util.getRandom();
    var now = util.getCurrentTime();
    var options = {
        host: reqUrl.host,
        path: reqUrl.path + "?sdkappid=" + this.appid + "&random=" + random,
        method: "POST",
        headers: {
            "Content-Type": "ap0plication/json"
        },
        body: {
            tel: phoneNumbers.map(function(pn) { return {nationcode: nationCode + "", mobile: pn + ""}; }),
            sign: sign,
            tpl_id: parseInt(templId),
            params: params,
            sig: util.calculateSignature(this.appkey, random, now, phoneNumbers),
            time: now,
            extend: !extend ? "" : extend + "",
            ext: !ext ? "" : ext + ""
        }
    };

    util.request(options);
};


/**
 * SmsStatusPuller
 *
 * @param  {string}  appid  - sdk appid
 * @param  {string}  appkey - sdk appkey
 * @constructor
 */
function SmsStatusPuller(appid, appkey) {
    this.appid = appid;
    this.appkey = appkey;
    this.url = "https://yun.tim.qq.com/v5/tlssmssvr/pullstatus";
}

/**
 * Pull SMS message status
 *
 * @param  {number}    msgType - SMS message type, Enum{0: normal SMS, 1: marketing SMS}
 * @param  {number}    max - maximum number of message status
 * @private
 */
SmsStatusPuller.prototype._pull = function(msgType, max) {
    // assert
    util.assert(typeof max == "number" && max > 0,
                "max must be an integer and great than zero");

    var reqUrl = url.parse(this.url);
    var random = util.getRandom();
    var now = util.getCurrentTime();
    var options = {
        host: reqUrl.host,
        path: reqUrl.path + "?sdkappid=" + this.appid + "&random=" + random,
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: {
            sig: util.calculateSignature(this.appkey, random, now),
            type: msgType,
            time: now,
            max: max
        }
    };

    util.request(options);
};

/**
 * Pull callback SMS messages status
 *
 * @param  {number}    max - maximum number of message status
 * @public
 */
SmsStatusPuller.prototype.pullCallback = function(max) {
    this._pull(0, max);
};

/**
 * Pull reply SMS messages status
 *
 * @param  {number}    max - maximum number of message status
 * @public
 */
SmsStatusPuller.prototype.pullReply = function(max) {
    this._pull(1, max);
};


/**
 * SmsMobileStatusPuller
 *
 * @param  {string}  appid  - sdk appid
 * @param  {string}  appkey - sdk appkey
 * @constructor
 */
function SmsMobileStatusPuller(appid, appkey) {
    this.appid = appid;
    this.appkey = appkey;
    this.url = "https://yun.tim.qq.com/v5/tlssmssvr/pullstatus4mobile";
}

/**
 * Pull SMS messages status for single mobile
 *
 * @param  {number}    msgType - SMS message type, Enum{0: normal SMS, 1: marketing SMS}
 * @param  {string}    nationCode - nation dialing code, e.g. China is 86, USA is 1
 * @param  {string}    mobile - mobile number
 * @param  {number}    beginTime - begin time, unix timestamp
 * @param  {number}    endTime - end time, unix timestamp
 * @param  {number}    max - maximum number of message status
 * @private
 */
SmsMobileStatusPuller.prototype._pull = function(msgType, nationCode, mobile, beginTime, endTime, max) {
    // assert
    util.assert(typeof beginTime == "number" && typeof endTime == "number",
                "beginTime and endTime must be an number");
    util.assert(typeof max == "number" && max > 0,
                "max must be an integer and great than zero");

    var reqUrl = url.parse(this.url);
    var random = util.getRandom();
    var now = util.getCurrentTime();
    var options = {
        host: reqUrl.host,
        path: reqUrl.path + "?sdkappid=" + this.appid + "&random=" + random,
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: {
            sig: util.calculateSignature(this.appkey, random, now),
            type: msgType,
            time: now,
            max: max,
            begin_time: beginTime,
            end_time: endTime,
            nationcode: nationCode + "",
            mobile: mobile + ""
        }
    };

    util.request(options);
}

/**
 * Pull callback SMS message status for single mobile
 *
 * @param  {string}    nationCode - nation dialing code, e.g. China is 86, USA is 1
 * @param  {string}    mobile - mobile number
 * @param  {number}    beginTime - begin time, unix timestamp
 * @param  {number}    endTime - end time, unix timestamp
 * @param  {number}    max - maximum number of message status
 * @public
 */
SmsMobileStatusPuller.prototype.pullCallback = function(nationCode, mobile, beginTime, endTime, max) {
    this._pull(0, nationCode, mobile, beginTime, endTime, max);
};

/**
 * Pull reply SMS message status for single mobile
 *
 * @param  {string}    nationCode - nation dialing code, e.g. China is 86, USA is 1
 * @param  {string}    mobile - mobile number
 * @param  {number}    beginTime - begin time, unix timestamp
 * @param  {number}    endTime - end time, unix timestamp
 * @param  {number}    max - maximum number of message status
 * @public
 */
SmsMobileStatusPuller.prototype.pullReply = function(nationCode, mobile, beginTime, endTime, max) {
    this._pull(1, nationCode, mobile, beginTime, endTime, max);
};
