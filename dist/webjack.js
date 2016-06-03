var WebJack = {};

// (function(exports){

//    exports = WebJack;

// })(typeof exports === 'undefined'? this={}: exports);

/* From http://ejohn.org/blog/simple-javascript-inheritance/ */

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
 
    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();

'use strict';

function SoftModemDecoder(baud, sampleRate, onReceived){
	this.baud = baud;
	this.sampleRate = sampleRate;
	this.onReceived = onReceived;
}

SoftModemDecoder.prototype = {
	baud = 1225,
	sampleRate = 0,
	onReceived = null,



	demod : function(samples){
		
	}
}
'use strict';

WebJack.Connection = Class.extend({

  init: function(args) {

    var connection = this;
    var receivedData;
		var audioCtx = new AudioContext();
		var encoder, decoder;

		function onAudioProcess(event) {
		  var buffer = event.inputBuffer;
		  var samplesIn = buffer.getChannelData(0);
		  console.log("-- audioprocess data (" + samplesIn.length + " samples) --");

		  if (!decoder){
		  	decoder = new SoftModemDecoder(connection.args, receivedData);
		  }
		  decoder.demod(samplesIn);
		}

		function successCallback(stream) {
		  var audioTracks = stream.getAudioTracks();
		  console.log('Using audio device: ' + audioTracks[0].label);
		  console.log("-- samplerate (" + audioCtx.sampleRate + ") --");
		  stream.onended = function() {
		    console.log('Stream ended');
		  };
		  audioSource = audioCtx.createMediaStreamSource(stream);
		  decoderNode = audioCtx.createScriptProcessor(8192, 1, 1); // buffersize, input channels, output channels
		  audioSource.connect(decoderNode);
		  decoderNode.addEventListener("audioprocess", onAudioProcess);
		  decoderNode.connect(audioCtx.destination); // Chrome does not fire events without destination 
		}

		function errorCallback(error) {
		  console.log('navigator.getUserMedia error: ', error);
		}

		navigator.mediaDevices.getUserMedia(
			{
			  audio: true,
			  video: false
			}
		).then(
		  successCallback,
		  errorCallback
		);


    connection.args = args; // connection.args.baud_rate, etc


    // an object containing two histories -- 
    // sent commands and received commands
    connection.history = {

      // oldest first:
      sent: [],

      // oldest first:
      received: []

    }


    // Sends request for a standard data packet
    connection.get = function(data) {
    	receivedData = function(bytes){
    			data(bytes);
    	};
    }


    // Sends data to device
    connection.send = function(data) {

      connection.history.sent.push(data);

    }


    // Listens for data packets and runs 
    // passed function listener() on results
    connection.listen = function(listener) {

      // connection.history.received.push(data);
      // listener(data);

    }    


    // Returns valid JSON object if possible, 
    // or <false> if not.
    connection.validateJSON = function(data) {

    }


  } 

});