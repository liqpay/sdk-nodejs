'use strict';
/**
 * Liqpay Payment Module
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is available through the world-wide-web at this URL:
 * http://opensource.org/licenses/osl-3.0.php
 *
 * @category        LiqPay
 * @package         liqpay/liqpay
 * @version         3.1
 * @author          Liqpay
 * @copyright       Copyright (c) 2014 Liqpay
 * @license         http://opensource.org/licenses/osl-3.0.php Open Software License (OSL 3.0)
 *
 * EXTENSION INFORMATION
 *
 * LIQPAY API       https://www.liqpay.com/ru/doc
 *
 */
var request = require('request');
var crypto  = require('crypto');



/**
 * Constructor.
 *
 * @param string $public_key
 * @param string $private_key
 * 
 * @throws InvalidArgumentException
 */
module.exports = function(public_key, private_key) {
	
	// API host
	this.host = "https://www.liqpay.com/api/";

	/**
	* Call API
	*
	* @param string $path
	* @param Object $params
	* @param function $callback
	*
	* @return Object
	*/
	this.api = function(path, params, callback, callbackerr){

		if(!params.version)
			throw new Error('version is null');

		params.public_key = public_key;		
		var data = new Buffer(JSON.stringify(params)).toString('base64');
		var signature = this.str_to_sign(private_key + data + private_key);

		request.post(this.host + path, { form: {data : data, signature : signature}}, function (error, response, body) {
		        if (!error && response.statusCode == 200) {
		            callback( JSON.parse(body) )
		        }else{
		        	callbackerr(error, response);
		        }
		    }
		);
	};


	/**
	 * cnb_form
	 *
	 * @param Object $params
	 *
	 * @return string
	 * 
	 * @throws InvalidArgumentException
	 */
	this.cnb_form = function(params){

		var language = "ru";
		if(params.language)
			language = params.language;

		params = this.cnb_params(params);
		var data = new Buffer(JSON.stringify(params)).toString('base64');
		var signature = this.str_to_sign(private_key + data + private_key);

		return '<form method="POST" action="https://www.liqpay.com/api/3/checkout" accept-charset="utf-8">' +
	                '<input type="hidden" name="data" value="'+data+'" />' +
	                '<input type="hidden" name="signature" value="'+signature+'" />' +                
	                '<input type="image" src="//static.liqpay.com/buttons/p1'+language+'.radius.png" name="btn_text" />' +
	            '</form>';

	};


	/**
	 * cnb_signature
	 *
	 * @param Object $params
	 *
	 * @return string
	 * 
	 * @throws InvalidArgumentException
	 */
	this.cnb_signature = function(params){
		
		params = this.cnb_params(params);
		var data = new Buffer(JSON.stringify(params)).toString('base64');
		return this.str_to_sign(private_key + data + private_key);
		
	};


	/**
	 * cnb_params
	 *
	 * @param Object $params
	 *
	 * @return Object $params
	 * 
	 * @throws InvalidArgumentException
	 */
	this.cnb_params = function(params){
		
		params.public_key = public_key;

		if(!params.version)
			throw new Error('version is null');			
		if(!params.amount)
			throw new Error('amount is null');
		if(!params.currency)
			throw new Error('currency is null');
		if(!params.description)
			throw new Error('description is null');

		return params;

	};


	/**
	 * str_to_sign
	 *
	 * @param string $str
	 *
	 * @return string
	 */
	this.str_to_sign = function(str){
		var sha1 = crypto.createHash('sha1');
			sha1.update(str);
		return sha1.digest('base64');			
	};
	
	
	/**
	* Return Form Object
	*/
	  this.cnb_object = function(params) {
	
	    var language = "ru";
	    if(params.language)
	      language = params.language;
	
	    params = this.cnb_params(params);
	    var data = new Buffer(JSON.stringify(params)).toString('base64');
	    var signature = this.str_to_sign(private_key + data + private_key);
	
	    return { data: data, signature: signature };
	  };

	return this;
};
