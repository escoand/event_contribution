var e,t="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n={};e=function(){var e=function(e){var t,n=e.localStorage||(t={},{setItem:function(e,n){t[e]=n},getItem:function(e){return t[e]},removeItem:function(e){delete t[e]}}),s={CONNECT:1,CONNACK:2,PUBLISH:3,PUBACK:4,PUBREC:5,PUBREL:6,PUBCOMP:7,SUBSCRIBE:8,SUBACK:9,UNSUBSCRIBE:10,UNSUBACK:11,PINGREQ:12,PINGRESP:13,DISCONNECT:14},i=function(e,t){for(var n in e)if(e.hasOwnProperty(n)){if(!t.hasOwnProperty(n)){var s="Unknown property, "+n+". Valid properties are:";for(var i in t)t.hasOwnProperty(i)&&(s=s+" "+i);throw new Error(s)}if(typeof e[n]!==t[n])throw new Error(a(r.INVALID_TYPE,[typeof e[n],n]))}},o=function(e,t){return function(){return e.apply(t,arguments)}},r={OK:{code:0,text:"AMQJSC0000I OK."},CONNECT_TIMEOUT:{code:1,text:"AMQJSC0001E Connect timed out."},SUBSCRIBE_TIMEOUT:{code:2,text:"AMQJS0002E Subscribe timed out."},UNSUBSCRIBE_TIMEOUT:{code:3,text:"AMQJS0003E Unsubscribe timed out."},PING_TIMEOUT:{code:4,text:"AMQJS0004E Ping timed out."},INTERNAL_ERROR:{code:5,text:"AMQJS0005E Internal error. Error Message: {0}, Stack trace: {1}"},CONNACK_RETURNCODE:{code:6,text:"AMQJS0006E Bad Connack return code:{0} {1}."},SOCKET_ERROR:{code:7,text:"AMQJS0007E Socket error:{0}."},SOCKET_CLOSE:{code:8,text:"AMQJS0008I Socket closed."},MALFORMED_UTF:{code:9,text:"AMQJS0009E Malformed UTF data:{0} {1} {2}."},UNSUPPORTED:{code:10,text:"AMQJS0010E {0} is not supported by this browser."},INVALID_STATE:{code:11,text:"AMQJS0011E Invalid state {0}."},INVALID_TYPE:{code:12,text:"AMQJS0012E Invalid type {0} for {1}."},INVALID_ARGUMENT:{code:13,text:"AMQJS0013E Invalid argument {0} for {1}."},UNSUPPORTED_OPERATION:{code:14,text:"AMQJS0014E Unsupported operation."},INVALID_STORED_DATA:{code:15,text:"AMQJS0015E Invalid data in local storage key={0} value={1}."},INVALID_MQTT_MESSAGE_TYPE:{code:16,text:"AMQJS0016E Invalid MQTT message type {0}."},MALFORMED_UNICODE:{code:17,text:"AMQJS0017E Malformed Unicode string:{0} {1}."},BUFFER_FULL:{code:18,text:"AMQJS0018E Message buffer is full, maximum buffer size: {0}."}},c={0:"Connection Accepted",1:"Connection Refused: unacceptable protocol version",2:"Connection Refused: identifier rejected",3:"Connection Refused: server unavailable",4:"Connection Refused: bad user name or password",5:"Connection Refused: not authorized"},a=function(e,t){var n=e.text;if(t)for(var s,i,o=0;o<t.length;o++)if(s="{"+o+"}",(i=n.indexOf(s))>0){var r=n.substring(0,i),c=n.substring(i+s.length);n=r+t[o]+c}return n},h=[0,6,77,81,73,115,100,112,3],l=[0,4,77,81,84,84,4],d=function(e,t){for(var n in this.type=e,t)t.hasOwnProperty(n)&&(this[n]=t[n])};function u(e,t){var n,i=t,o=e[t],r=o>>4,c=o&=15;t+=1;var a=0,h=1;do{if(t==e.length)return[null,i];a+=(127&(n=e[t++]))*h,h*=128}while(0!=(128&n));var l=t+a;if(l>e.length)return[null,i];var u=new d(r);switch(r){case s.CONNACK:1&e[t++]&&(u.sessionPresent=!0),u.returnCode=e[t++];break;case s.PUBLISH:var f=c>>1&3,g=p(e,t),_=y(e,t+=2,g);t+=g,f>0&&(u.messageIdentifier=p(e,t),t+=2);var m=new w(e.subarray(t,l));1==(1&c)&&(m.retained=!0),8==(8&c)&&(m.duplicate=!0),m.qos=f,m.destinationName=_,u.payloadMessage=m;break;case s.PUBACK:case s.PUBREC:case s.PUBREL:case s.PUBCOMP:case s.UNSUBACK:u.messageIdentifier=p(e,t);break;case s.SUBACK:u.messageIdentifier=p(e,t),t+=2,u.returnCode=e.subarray(t,l)}return[u,l]}function f(e,t,n){return t[n++]=e>>8,t[n++]=e%256,n}function g(e,t,n,s){return m(e,n,s=f(t,n,s)),s+t}function p(e,t){return 256*e[t]+e[t+1]}function _(e){for(var t=0,n=0;n<e.length;n++){var s=e.charCodeAt(n);s>2047?(55296<=s&&s<=56319&&(n++,t++),t+=3):s>127?t+=2:t++}return t}function m(e,t,n){for(var s=n,i=0;i<e.length;i++){var o=e.charCodeAt(i);if(55296<=o&&o<=56319){var c=e.charCodeAt(++i);if(isNaN(c))throw new Error(a(r.MALFORMED_UNICODE,[o,c]));o=c-56320+(o-55296<<10)+65536}o<=127?t[s++]=o:o<=2047?(t[s++]=o>>6&31|192,t[s++]=63&o|128):o<=65535?(t[s++]=o>>12&15|224,t[s++]=o>>6&63|128,t[s++]=63&o|128):(t[s++]=o>>18&7|240,t[s++]=o>>12&63|128,t[s++]=o>>6&63|128,t[s++]=63&o|128)}return t}function y(e,t,n){for(var s,i="",o=t;o<t+n;){var c=e[o++];if(c<128)s=c;else{var h=e[o++]-128;if(h<0)throw new Error(a(r.MALFORMED_UTF,[c.toString(16),h.toString(16),""]));if(c<224)s=64*(c-192)+h;else{var l=e[o++]-128;if(l<0)throw new Error(a(r.MALFORMED_UTF,[c.toString(16),h.toString(16),l.toString(16)]));if(c<240)s=4096*(c-224)+64*h+l;else{var d=e[o++]-128;if(d<0)throw new Error(a(r.MALFORMED_UTF,[c.toString(16),h.toString(16),l.toString(16),d.toString(16)]));if(!(c<248))throw new Error(a(r.MALFORMED_UTF,[c.toString(16),h.toString(16),l.toString(16),d.toString(16)]));s=262144*(c-240)+4096*h+64*l+d}}}s>65535&&(s-=65536,i+=String.fromCharCode(55296+(s>>10)),s=56320+(1023&s)),i+=String.fromCharCode(s)}return i}d.prototype.encode=function(){var e,t=(15&this.type)<<4,n=0,i=[],o=0;switch(void 0!==this.messageIdentifier&&(n+=2),this.type){case s.CONNECT:switch(this.mqttVersion){case 3:n+=h.length+3;break;case 4:n+=l.length+3}n+=_(this.clientId)+2,void 0!==this.willMessage&&(n+=_(this.willMessage.destinationName)+2,(e=this.willMessage.payloadBytes)instanceof Uint8Array||(e=new Uint8Array(c)),n+=e.byteLength+2),void 0!==this.userName&&(n+=_(this.userName)+2),void 0!==this.password&&(n+=_(this.password)+2);break;case s.SUBSCRIBE:t|=2;for(var r=0;r<this.topics.length;r++)i[r]=_(this.topics[r]),n+=i[r]+2;n+=this.requestedQos.length;break;case s.UNSUBSCRIBE:for(t|=2,r=0;r<this.topics.length;r++)i[r]=_(this.topics[r]),n+=i[r]+2;break;case s.PUBREL:t|=2;break;case s.PUBLISH:this.payloadMessage.duplicate&&(t|=8),t=t|=this.payloadMessage.qos<<1,this.payloadMessage.retained&&(t|=1),n+=(o=_(this.payloadMessage.destinationName))+2;var c=this.payloadMessage.payloadBytes;n+=c.byteLength,c instanceof ArrayBuffer?c=new Uint8Array(c):c instanceof Uint8Array||(c=new Uint8Array(c.buffer))}var a=function(e){var t=new Array(1),n=0;do{var s=e%128;(e>>=7)>0&&(s|=128),t[n++]=s}while(e>0&&n<4);return t}(n),d=a.length+1,u=new ArrayBuffer(n+d),p=new Uint8Array(u);if(p[0]=t,p.set(a,1),this.type==s.PUBLISH)d=g(this.payloadMessage.destinationName,o,p,d);else if(this.type==s.CONNECT){switch(this.mqttVersion){case 3:p.set(h,d),d+=h.length;break;case 4:p.set(l,d),d+=l.length}var m=0;this.cleanSession&&(m=2),void 0!==this.willMessage&&(m|=4,m|=this.willMessage.qos<<3,this.willMessage.retained&&(m|=32)),void 0!==this.userName&&(m|=128),void 0!==this.password&&(m|=64),p[d++]=m,d=f(this.keepAliveInterval,p,d)}switch(void 0!==this.messageIdentifier&&(d=f(this.messageIdentifier,p,d)),this.type){case s.CONNECT:d=g(this.clientId,_(this.clientId),p,d),void 0!==this.willMessage&&(d=g(this.willMessage.destinationName,_(this.willMessage.destinationName),p,d),d=f(e.byteLength,p,d),p.set(e,d),d+=e.byteLength),void 0!==this.userName&&(d=g(this.userName,_(this.userName),p,d)),void 0!==this.password&&(d=g(this.password,_(this.password),p,d));break;case s.PUBLISH:p.set(c,d);break;case s.SUBSCRIBE:for(r=0;r<this.topics.length;r++)d=g(this.topics[r],i[r],p,d),p[d++]=this.requestedQos[r];break;case s.UNSUBSCRIBE:for(r=0;r<this.topics.length;r++)d=g(this.topics[r],i[r],p,d)}return u};var v=function(e,t){this._client=e,this._keepAliveInterval=1e3*t,this.isReset=!1;var n=new d(s.PINGREQ).encode(),i=function(e){return function(){return o.apply(e)}},o=function(){this.isReset?(this.isReset=!1,this._client._trace("Pinger.doPing","send PINGREQ"),this._client.socket.send(n),this.timeout=setTimeout(i(this),this._keepAliveInterval)):(this._client._trace("Pinger.doPing","Timed out"),this._client._disconnected(r.PING_TIMEOUT.code,a(r.PING_TIMEOUT)))};this.reset=function(){this.isReset=!0,clearTimeout(this.timeout),this._keepAliveInterval>0&&(this.timeout=setTimeout(i(this),this._keepAliveInterval))},this.cancel=function(){clearTimeout(this.timeout)}},E=function(e,t,n,s){t||(t=30),this.timeout=setTimeout(function(e,t,n){return function(){return e.apply(t,n)}}(n,e,s),1e3*t),this.cancel=function(){clearTimeout(this.timeout)}},I=function(t,s,i,o,c){if(!("WebSocket"in e)||null===e.WebSocket)throw new Error(a(r.UNSUPPORTED,["WebSocket"]));if(!("ArrayBuffer"in e)||null===e.ArrayBuffer)throw new Error(a(r.UNSUPPORTED,["ArrayBuffer"]));for(var h in this._trace("Paho.Client",t,s,i,o,c),this.host=s,this.port=i,this.path=o,this.uri=t,this.clientId=c,this._wsuri=null,this._localKey=s+":"+i+("/mqtt"!=o?":"+o:"")+":"+c+":",this._msg_queue=[],this._buffered_msg_queue=[],this._sentMessages={},this._receivedMessages={},this._notify_msg_sent={},this._message_identifier=1,this._sequence=0,n)0!==h.indexOf("Sent:"+this._localKey)&&0!==h.indexOf("Received:"+this._localKey)||this.restore(h)};I.prototype.host=null,I.prototype.port=null,I.prototype.path=null,I.prototype.uri=null,I.prototype.clientId=null,I.prototype.socket=null,I.prototype.connected=!1,I.prototype.maxMessageIdentifier=65536,I.prototype.connectOptions=null,I.prototype.hostIndex=null,I.prototype.onConnected=null,I.prototype.onConnectionLost=null,I.prototype.onMessageDelivered=null,I.prototype.onMessageArrived=null,I.prototype.traceFunction=null,I.prototype._msg_queue=null,I.prototype._buffered_msg_queue=null,I.prototype._connectTimeout=null,I.prototype.sendPinger=null,I.prototype.receivePinger=null,I.prototype._reconnectInterval=1,I.prototype._reconnecting=!1,I.prototype._reconnectTimeout=null,I.prototype.disconnectedPublishing=!1,I.prototype.disconnectedBufferSize=5e3,I.prototype.receiveBuffer=null,I.prototype._traceBuffer=null,I.prototype._MAX_TRACE_ENTRIES=100,I.prototype.connect=function(e){var t=this._traceMask(e,"password");if(this._trace("Client.connect",t,this.socket,this.connected),this.connected)throw new Error(a(r.INVALID_STATE,["already connected"]));if(this.socket)throw new Error(a(r.INVALID_STATE,["already connected"]));this._reconnecting&&(this._reconnectTimeout.cancel(),this._reconnectTimeout=null,this._reconnecting=!1),this.connectOptions=e,this._reconnectInterval=1,this._reconnecting=!1,e.uris?(this.hostIndex=0,this._doConnect(e.uris[0])):this._doConnect(this.uri)},I.prototype.subscribe=function(e,t){if(this._trace("Client.subscribe",e,t),!this.connected)throw new Error(a(r.INVALID_STATE,["not connected"]));var n=new d(s.SUBSCRIBE);n.topics=e.constructor===Array?e:[e],void 0===t.qos&&(t.qos=0),n.requestedQos=[];for(var i=0;i<n.topics.length;i++)n.requestedQos[i]=t.qos;t.onSuccess&&(n.onSuccess=function(e){t.onSuccess({invocationContext:t.invocationContext,grantedQos:e})}),t.onFailure&&(n.onFailure=function(e){t.onFailure({invocationContext:t.invocationContext,errorCode:e,errorMessage:a(e)})}),t.timeout&&(n.timeOut=new E(this,t.timeout,t.onFailure,[{invocationContext:t.invocationContext,errorCode:r.SUBSCRIBE_TIMEOUT.code,errorMessage:a(r.SUBSCRIBE_TIMEOUT)}])),this._requires_ack(n),this._schedule_message(n)},I.prototype.unsubscribe=function(e,t){if(this._trace("Client.unsubscribe",e,t),!this.connected)throw new Error(a(r.INVALID_STATE,["not connected"]));var n=new d(s.UNSUBSCRIBE);n.topics=e.constructor===Array?e:[e],t.onSuccess&&(n.callback=function(){t.onSuccess({invocationContext:t.invocationContext})}),t.timeout&&(n.timeOut=new E(this,t.timeout,t.onFailure,[{invocationContext:t.invocationContext,errorCode:r.UNSUBSCRIBE_TIMEOUT.code,errorMessage:a(r.UNSUBSCRIBE_TIMEOUT)}])),this._requires_ack(n),this._schedule_message(n)},I.prototype.send=function(e){this._trace("Client.send",e);var t=new d(s.PUBLISH);if(t.payloadMessage=e,this.connected)e.qos>0?this._requires_ack(t):this.onMessageDelivered&&(this._notify_msg_sent[t]=this.onMessageDelivered(t.payloadMessage)),this._schedule_message(t);else{if(!this._reconnecting||!this.disconnectedPublishing)throw new Error(a(r.INVALID_STATE,["not connected"]));if(Object.keys(this._sentMessages).length+this._buffered_msg_queue.length>this.disconnectedBufferSize)throw new Error(a(r.BUFFER_FULL,[this.disconnectedBufferSize]));e.qos>0?this._requires_ack(t):(t.sequence=++this._sequence,this._buffered_msg_queue.unshift(t))}},I.prototype.disconnect=function(){if(this._trace("Client.disconnect"),this._reconnecting&&(this._reconnectTimeout.cancel(),this._reconnectTimeout=null,this._reconnecting=!1),!this.socket)throw new Error(a(r.INVALID_STATE,["not connecting or connected"]));var e=new d(s.DISCONNECT);this._notify_msg_sent[e]=o(this._disconnected,this),this._schedule_message(e)},I.prototype.getTraceLog=function(){if(null!==this._traceBuffer){for(var e in this._trace("Client.getTraceLog",new Date),this._trace("Client.getTraceLog in flight messages",this._sentMessages.length),this._sentMessages)this._trace("_sentMessages ",e,this._sentMessages[e]);for(var e in this._receivedMessages)this._trace("_receivedMessages ",e,this._receivedMessages[e]);return this._traceBuffer}},I.prototype.startTrace=function(){null===this._traceBuffer&&(this._traceBuffer=[]),this._trace("Client.startTrace",new Date,"@VERSION@-@BUILDLEVEL@")},I.prototype.stopTrace=function(){delete this._traceBuffer},I.prototype._doConnect=function(e){if(this.connectOptions.useSSL){var t=e.split(":");t[0]="wss",e=t.join(":")}this._wsuri=e,this.connected=!1,this.connectOptions.mqttVersion<4?this.socket=new WebSocket(e,["mqttv3.1"]):this.socket=new WebSocket(e,["mqtt"]),this.socket.binaryType="arraybuffer",this.socket.onopen=o(this._on_socket_open,this),this.socket.onmessage=o(this._on_socket_message,this),this.socket.onerror=o(this._on_socket_error,this),this.socket.onclose=o(this._on_socket_close,this),this.sendPinger=new v(this,this.connectOptions.keepAliveInterval),this.receivePinger=new v(this,this.connectOptions.keepAliveInterval),this._connectTimeout&&(this._connectTimeout.cancel(),this._connectTimeout=null),this._connectTimeout=new E(this,this.connectOptions.timeout,this._disconnected,[r.CONNECT_TIMEOUT.code,a(r.CONNECT_TIMEOUT)])},I.prototype._schedule_message=function(e){this._msg_queue.unshift(e),this.connected&&this._process_queue()},I.prototype.store=function(e,t){var i={type:t.type,messageIdentifier:t.messageIdentifier,version:1};if(t.type!==s.PUBLISH)throw Error(a(r.INVALID_STORED_DATA,[e+this._localKey+t.messageIdentifier,i]));t.pubRecReceived&&(i.pubRecReceived=!0),i.payloadMessage={};for(var o="",c=t.payloadMessage.payloadBytes,h=0;h<c.length;h++)c[h]<=15?o=o+"0"+c[h].toString(16):o+=c[h].toString(16);i.payloadMessage.payloadHex=o,i.payloadMessage.qos=t.payloadMessage.qos,i.payloadMessage.destinationName=t.payloadMessage.destinationName,t.payloadMessage.duplicate&&(i.payloadMessage.duplicate=!0),t.payloadMessage.retained&&(i.payloadMessage.retained=!0),0===e.indexOf("Sent:")&&(void 0===t.sequence&&(t.sequence=++this._sequence),i.sequence=t.sequence),n.setItem(e+this._localKey+t.messageIdentifier,JSON.stringify(i))},I.prototype.restore=function(e){var t=n.getItem(e),i=JSON.parse(t),o=new d(i.type,i);if(i.type!==s.PUBLISH)throw Error(a(r.INVALID_STORED_DATA,[e,t]));for(var c=i.payloadMessage.payloadHex,h=new ArrayBuffer(c.length/2),l=new Uint8Array(h),u=0;c.length>=2;){var f=parseInt(c.substring(0,2),16);c=c.substring(2,c.length),l[u++]=f}var g=new w(l);g.qos=i.payloadMessage.qos,g.destinationName=i.payloadMessage.destinationName,i.payloadMessage.duplicate&&(g.duplicate=!0),i.payloadMessage.retained&&(g.retained=!0),o.payloadMessage=g,0===e.indexOf("Sent:"+this._localKey)?(o.payloadMessage.duplicate=!0,this._sentMessages[o.messageIdentifier]=o):0===e.indexOf("Received:"+this._localKey)&&(this._receivedMessages[o.messageIdentifier]=o)},I.prototype._process_queue=function(){for(var e=null;e=this._msg_queue.pop();)this._socket_send(e),this._notify_msg_sent[e]&&(this._notify_msg_sent[e](),delete this._notify_msg_sent[e])},I.prototype._requires_ack=function(e){var t=Object.keys(this._sentMessages).length;if(t>this.maxMessageIdentifier)throw Error("Too many messages:"+t);for(;void 0!==this._sentMessages[this._message_identifier];)this._message_identifier++;e.messageIdentifier=this._message_identifier,this._sentMessages[e.messageIdentifier]=e,e.type===s.PUBLISH&&this.store("Sent:",e),this._message_identifier===this.maxMessageIdentifier&&(this._message_identifier=1)},I.prototype._on_socket_open=function(){var e=new d(s.CONNECT,this.connectOptions);e.clientId=this.clientId,this._socket_send(e)},I.prototype._on_socket_message=function(e){this._trace("Client._on_socket_message",e.data);for(var t=this._deframeMessages(e.data),n=0;n<t.length;n+=1)this._handleMessage(t[n])},I.prototype._deframeMessages=function(e){var t=new Uint8Array(e),n=[];if(this.receiveBuffer){var s=new Uint8Array(this.receiveBuffer.length+t.length);s.set(this.receiveBuffer),s.set(t,this.receiveBuffer.length),t=s,delete this.receiveBuffer}try{for(var i=0;i<t.length;){var o=u(t,i),c=o[0];if(i=o[1],null===c)break;n.push(c)}i<t.length&&(this.receiveBuffer=t.subarray(i))}catch(e){var h="undefined"==e.hasOwnProperty("stack")?e.stack.toString():"No Error Stack Available";return void this._disconnected(r.INTERNAL_ERROR.code,a(r.INTERNAL_ERROR,[e.message,h]))}return n},I.prototype._handleMessage=function(e){this._trace("Client._handleMessage",e);try{switch(e.type){case s.CONNACK:if(this._connectTimeout.cancel(),this._reconnectTimeout&&this._reconnectTimeout.cancel(),this.connectOptions.cleanSession){for(var t in this._sentMessages){var i=this._sentMessages[t];n.removeItem("Sent:"+this._localKey+i.messageIdentifier)}for(var t in this._sentMessages={},this._receivedMessages){var o=this._receivedMessages[t];n.removeItem("Received:"+this._localKey+o.messageIdentifier)}this._receivedMessages={}}if(0!==e.returnCode){this._disconnected(r.CONNACK_RETURNCODE.code,a(r.CONNACK_RETURNCODE,[e.returnCode,c[e.returnCode]]));break}this.connected=!0,this.connectOptions.uris&&(this.hostIndex=this.connectOptions.uris.length);var h=[];for(var l in this._sentMessages)this._sentMessages.hasOwnProperty(l)&&h.push(this._sentMessages[l]);if(this._buffered_msg_queue.length>0)for(var u=null;u=this._buffered_msg_queue.pop();)h.push(u),this.onMessageDelivered&&(this._notify_msg_sent[u]=this.onMessageDelivered(u.payloadMessage));h=h.sort((function(e,t){return e.sequence-t.sequence}));for(var f=0,g=h.length;f<g;f++)if((i=h[f]).type==s.PUBLISH&&i.pubRecReceived){var p=new d(s.PUBREL,{messageIdentifier:i.messageIdentifier});this._schedule_message(p)}else this._schedule_message(i);this.connectOptions.onSuccess&&this.connectOptions.onSuccess({invocationContext:this.connectOptions.invocationContext});var _=!1;this._reconnecting&&(_=!0,this._reconnectInterval=1,this._reconnecting=!1),this._connected(_,this._wsuri),this._process_queue();break;case s.PUBLISH:this._receivePublish(e);break;case s.PUBACK:(i=this._sentMessages[e.messageIdentifier])&&(delete this._sentMessages[e.messageIdentifier],n.removeItem("Sent:"+this._localKey+e.messageIdentifier),this.onMessageDelivered&&this.onMessageDelivered(i.payloadMessage));break;case s.PUBREC:(i=this._sentMessages[e.messageIdentifier])&&(i.pubRecReceived=!0,p=new d(s.PUBREL,{messageIdentifier:e.messageIdentifier}),this.store("Sent:",i),this._schedule_message(p));break;case s.PUBREL:o=this._receivedMessages[e.messageIdentifier],n.removeItem("Received:"+this._localKey+e.messageIdentifier),o&&(this._receiveMessage(o),delete this._receivedMessages[e.messageIdentifier]);var m=new d(s.PUBCOMP,{messageIdentifier:e.messageIdentifier});this._schedule_message(m);break;case s.PUBCOMP:i=this._sentMessages[e.messageIdentifier],delete this._sentMessages[e.messageIdentifier],n.removeItem("Sent:"+this._localKey+e.messageIdentifier),this.onMessageDelivered&&this.onMessageDelivered(i.payloadMessage);break;case s.SUBACK:(i=this._sentMessages[e.messageIdentifier])&&(i.timeOut&&i.timeOut.cancel(),128===e.returnCode[0]?i.onFailure&&i.onFailure(e.returnCode):i.onSuccess&&i.onSuccess(e.returnCode),delete this._sentMessages[e.messageIdentifier]);break;case s.UNSUBACK:(i=this._sentMessages[e.messageIdentifier])&&(i.timeOut&&i.timeOut.cancel(),i.callback&&i.callback(),delete this._sentMessages[e.messageIdentifier]);break;case s.PINGRESP:this.sendPinger.reset();break;case s.DISCONNECT:default:this._disconnected(r.INVALID_MQTT_MESSAGE_TYPE.code,a(r.INVALID_MQTT_MESSAGE_TYPE,[e.type]))}}catch(e){var y="undefined"==e.hasOwnProperty("stack")?e.stack.toString():"No Error Stack Available";return void this._disconnected(r.INTERNAL_ERROR.code,a(r.INTERNAL_ERROR,[e.message,y]))}},I.prototype._on_socket_error=function(e){this._reconnecting||this._disconnected(r.SOCKET_ERROR.code,a(r.SOCKET_ERROR,[e.data]))},I.prototype._on_socket_close=function(){this._reconnecting||this._disconnected(r.SOCKET_CLOSE.code,a(r.SOCKET_CLOSE))},I.prototype._socket_send=function(e){if(1==e.type){var t=this._traceMask(e,"password");this._trace("Client._socket_send",t)}else this._trace("Client._socket_send",e);this.socket.send(e.encode()),this.sendPinger.reset()},I.prototype._receivePublish=function(e){switch(e.payloadMessage.qos){case"undefined":case 0:this._receiveMessage(e);break;case 1:var t=new d(s.PUBACK,{messageIdentifier:e.messageIdentifier});this._schedule_message(t),this._receiveMessage(e);break;case 2:this._receivedMessages[e.messageIdentifier]=e,this.store("Received:",e);var n=new d(s.PUBREC,{messageIdentifier:e.messageIdentifier});this._schedule_message(n);break;default:throw Error("Invaild qos="+e.payloadMessage.qos)}},I.prototype._receiveMessage=function(e){this.onMessageArrived&&this.onMessageArrived(e.payloadMessage)},I.prototype._connected=function(e,t){this.onConnected&&this.onConnected(e,t)},I.prototype._reconnect=function(){this._trace("Client._reconnect"),this.connected||(this._reconnecting=!0,this.sendPinger.cancel(),this.receivePinger.cancel(),this._reconnectInterval<128&&(this._reconnectInterval=2*this._reconnectInterval),this.connectOptions.uris?(this.hostIndex=0,this._doConnect(this.connectOptions.uris[0])):this._doConnect(this.uri))},I.prototype._disconnected=function(e,t){if(this._trace("Client._disconnected",e,t),void 0!==e&&this._reconnecting)this._reconnectTimeout=new E(this,this._reconnectInterval,this._reconnect);else if(this.sendPinger.cancel(),this.receivePinger.cancel(),this._connectTimeout&&(this._connectTimeout.cancel(),this._connectTimeout=null),this._msg_queue=[],this._buffered_msg_queue=[],this._notify_msg_sent={},this.socket&&(this.socket.onopen=null,this.socket.onmessage=null,this.socket.onerror=null,this.socket.onclose=null,1===this.socket.readyState&&this.socket.close(),delete this.socket),this.connectOptions.uris&&this.hostIndex<this.connectOptions.uris.length-1)this.hostIndex++,this._doConnect(this.connectOptions.uris[this.hostIndex]);else if(void 0===e&&(e=r.OK.code,t=a(r.OK)),this.connected){if(this.connected=!1,this.onConnectionLost&&this.onConnectionLost({errorCode:e,errorMessage:t,reconnect:this.connectOptions.reconnect,uri:this._wsuri}),e!==r.OK.code&&this.connectOptions.reconnect)return this._reconnectInterval=1,void this._reconnect()}else 4===this.connectOptions.mqttVersion&&!1===this.connectOptions.mqttVersionExplicit?(this._trace("Failed to connect V4, dropping back to V3"),this.connectOptions.mqttVersion=3,this.connectOptions.uris?(this.hostIndex=0,this._doConnect(this.connectOptions.uris[0])):this._doConnect(this.uri)):this.connectOptions.onFailure&&this.connectOptions.onFailure({invocationContext:this.connectOptions.invocationContext,errorCode:e,errorMessage:t})},I.prototype._trace=function(){if(this.traceFunction){var e=Array.prototype.slice.call(arguments);for(var t in e)void 0!==e[t]&&e.splice(t,1,JSON.stringify(e[t]));var n=e.join("");this.traceFunction({severity:"Debug",message:n})}if(null!==this._traceBuffer){t=0;for(var s=arguments.length;t<s;t++)this._traceBuffer.length==this._MAX_TRACE_ENTRIES&&this._traceBuffer.shift(),0===t||void 0===arguments[t]?this._traceBuffer.push(arguments[t]):this._traceBuffer.push("  "+JSON.stringify(arguments[t]))}},I.prototype._traceMask=function(e,t){var n={};for(var s in e)e.hasOwnProperty(s)&&(n[s]=s==t?"******":e[s]);return n};var w=function(e){var t,n;if(!("string"==typeof e||e instanceof ArrayBuffer||ArrayBuffer.isView(e)&&!(e instanceof DataView)))throw a(r.INVALID_ARGUMENT,[e,"newPayload"]);t=e;var s=0,i=!1,o=!1;Object.defineProperties(this,{payloadString:{enumerable:!0,get:function(){return"string"==typeof t?t:y(t,0,t.length)}},payloadBytes:{enumerable:!0,get:function(){if("string"==typeof t){var e=new ArrayBuffer(_(t)),n=new Uint8Array(e);return m(t,n,0),n}return t}},destinationName:{enumerable:!0,get:function(){return n},set:function(e){if("string"!=typeof e)throw new Error(a(r.INVALID_ARGUMENT,[e,"newDestinationName"]));n=e}},qos:{enumerable:!0,get:function(){return s},set:function(e){if(0!==e&&1!==e&&2!==e)throw new Error("Invalid argument:"+e);s=e}},retained:{enumerable:!0,get:function(){return i},set:function(e){if("boolean"!=typeof e)throw new Error(a(r.INVALID_ARGUMENT,[e,"newRetained"]));i=e}},topic:{enumerable:!0,get:function(){return n},set:function(e){n=e}},duplicate:{enumerable:!0,get:function(){return o},set:function(e){o=e}}})};return{Client:function(e,t,n,s){var o;if("string"!=typeof e)throw new Error(a(r.INVALID_TYPE,[typeof e,"host"]));if(2==arguments.length){s=t;var c=(o=e).match(/^(wss?):\/\/((\[(.+)\])|([^\/]+?))(:(\d+))?(\/.*)$/);if(!c)throw new Error(a(r.INVALID_ARGUMENT,[e,"host"]));e=c[4]||c[2],t=parseInt(c[7]),n=c[8]}else{if(3==arguments.length&&(s=n,n="/mqtt"),"number"!=typeof t||t<0)throw new Error(a(r.INVALID_TYPE,[typeof t,"port"]));if("string"!=typeof n)throw new Error(a(r.INVALID_TYPE,[typeof n,"path"]));var h=-1!==e.indexOf(":")&&"["!==e.slice(0,1)&&"]"!==e.slice(-1);o="ws://"+(h?"["+e+"]":e)+":"+t+n}for(var l=0,d=0;d<s.length;d++){var u=s.charCodeAt(d);55296<=u&&u<=56319&&d++,l++}if("string"!=typeof s||l>65535)throw new Error(a(r.INVALID_ARGUMENT,[s,"clientId"]));var f=new I(o,e,t,n,s);Object.defineProperties(this,{host:{get:function(){return e},set:function(){throw new Error(a(r.UNSUPPORTED_OPERATION))}},port:{get:function(){return t},set:function(){throw new Error(a(r.UNSUPPORTED_OPERATION))}},path:{get:function(){return n},set:function(){throw new Error(a(r.UNSUPPORTED_OPERATION))}},uri:{get:function(){return o},set:function(){throw new Error(a(r.UNSUPPORTED_OPERATION))}},clientId:{get:function(){return f.clientId},set:function(){throw new Error(a(r.UNSUPPORTED_OPERATION))}},onConnected:{get:function(){return f.onConnected},set:function(e){if("function"!=typeof e)throw new Error(a(r.INVALID_TYPE,[typeof e,"onConnected"]));f.onConnected=e}},disconnectedPublishing:{get:function(){return f.disconnectedPublishing},set:function(e){f.disconnectedPublishing=e}},disconnectedBufferSize:{get:function(){return f.disconnectedBufferSize},set:function(e){f.disconnectedBufferSize=e}},onConnectionLost:{get:function(){return f.onConnectionLost},set:function(e){if("function"!=typeof e)throw new Error(a(r.INVALID_TYPE,[typeof e,"onConnectionLost"]));f.onConnectionLost=e}},onMessageDelivered:{get:function(){return f.onMessageDelivered},set:function(e){if("function"!=typeof e)throw new Error(a(r.INVALID_TYPE,[typeof e,"onMessageDelivered"]));f.onMessageDelivered=e}},onMessageArrived:{get:function(){return f.onMessageArrived},set:function(e){if("function"!=typeof e)throw new Error(a(r.INVALID_TYPE,[typeof e,"onMessageArrived"]));f.onMessageArrived=e}},trace:{get:function(){return f.traceFunction},set:function(e){if("function"!=typeof e)throw new Error(a(r.INVALID_TYPE,[typeof e,"onTrace"]));f.traceFunction=e}}}),this.connect=function(e){if(i(e=e||{},{timeout:"number",userName:"string",password:"string",willMessage:"object",keepAliveInterval:"number",cleanSession:"boolean",useSSL:"boolean",invocationContext:"object",onSuccess:"function",onFailure:"function",hosts:"object",ports:"object",reconnect:"boolean",mqttVersion:"number",mqttVersionExplicit:"boolean",uris:"object"}),void 0===e.keepAliveInterval&&(e.keepAliveInterval=60),e.mqttVersion>4||e.mqttVersion<3)throw new Error(a(r.INVALID_ARGUMENT,[e.mqttVersion,"connectOptions.mqttVersion"]));if(void 0===e.mqttVersion?(e.mqttVersionExplicit=!1,e.mqttVersion=4):e.mqttVersionExplicit=!0,void 0!==e.password&&void 0===e.userName)throw new Error(a(r.INVALID_ARGUMENT,[e.password,"connectOptions.password"]));if(e.willMessage){if(!(e.willMessage instanceof w))throw new Error(a(r.INVALID_TYPE,[e.willMessage,"connectOptions.willMessage"]));if(e.willMessage.stringPayload=null,void 0===e.willMessage.destinationName)throw new Error(a(r.INVALID_TYPE,[typeof e.willMessage.destinationName,"connectOptions.willMessage.destinationName"]))}if(void 0===e.cleanSession&&(e.cleanSession=!0),e.hosts){if(!(e.hosts instanceof Array))throw new Error(a(r.INVALID_ARGUMENT,[e.hosts,"connectOptions.hosts"]));if(e.hosts.length<1)throw new Error(a(r.INVALID_ARGUMENT,[e.hosts,"connectOptions.hosts"]));for(var t=!1,s=0;s<e.hosts.length;s++){if("string"!=typeof e.hosts[s])throw new Error(a(r.INVALID_TYPE,[typeof e.hosts[s],"connectOptions.hosts["+s+"]"]));if(/^(wss?):\/\/((\[(.+)\])|([^\/]+?))(:(\d+))?(\/.*)$/.test(e.hosts[s])){if(0===s)t=!0;else if(!t)throw new Error(a(r.INVALID_ARGUMENT,[e.hosts[s],"connectOptions.hosts["+s+"]"]))}else if(t)throw new Error(a(r.INVALID_ARGUMENT,[e.hosts[s],"connectOptions.hosts["+s+"]"]))}if(t)e.uris=e.hosts;else{if(!e.ports)throw new Error(a(r.INVALID_ARGUMENT,[e.ports,"connectOptions.ports"]));if(!(e.ports instanceof Array))throw new Error(a(r.INVALID_ARGUMENT,[e.ports,"connectOptions.ports"]));if(e.hosts.length!==e.ports.length)throw new Error(a(r.INVALID_ARGUMENT,[e.ports,"connectOptions.ports"]));for(e.uris=[],s=0;s<e.hosts.length;s++){if("number"!=typeof e.ports[s]||e.ports[s]<0)throw new Error(a(r.INVALID_TYPE,[typeof e.ports[s],"connectOptions.ports["+s+"]"]));var c=e.hosts[s],h=e.ports[s],l=-1!==c.indexOf(":");o="ws://"+(l?"["+c+"]":c)+":"+h+n,e.uris.push(o)}}}f.connect(e)},this.subscribe=function(e,t){if("string"!=typeof e&&e.constructor!==Array)throw new Error("Invalid argument:"+e);if(i(t=t||{},{qos:"number",invocationContext:"object",onSuccess:"function",onFailure:"function",timeout:"number"}),t.timeout&&!t.onFailure)throw new Error("subscribeOptions.timeout specified with no onFailure callback.");if(void 0!==t.qos&&0!==t.qos&&1!==t.qos&&2!==t.qos)throw new Error(a(r.INVALID_ARGUMENT,[t.qos,"subscribeOptions.qos"]));f.subscribe(e,t)},this.unsubscribe=function(e,t){if("string"!=typeof e&&e.constructor!==Array)throw new Error("Invalid argument:"+e);if(i(t=t||{},{invocationContext:"object",onSuccess:"function",onFailure:"function",timeout:"number"}),t.timeout&&!t.onFailure)throw new Error("unsubscribeOptions.timeout specified with no onFailure callback.");f.unsubscribe(e,t)},this.send=function(e,t,n,s){var i;if(0===arguments.length)throw new Error("Invalid argument.length");if(1==arguments.length){if(!(e instanceof w)&&"string"!=typeof e)throw new Error("Invalid argument:"+typeof e);if(void 0===(i=e).destinationName)throw new Error(a(r.INVALID_ARGUMENT,[i.destinationName,"Message.destinationName"]));f.send(i)}else(i=new w(t)).destinationName=e,arguments.length>=3&&(i.qos=n),arguments.length>=4&&(i.retained=s),f.send(i)},this.publish=function(e,t,n,s){var i;if(0===arguments.length)throw new Error("Invalid argument.length");if(1==arguments.length){if(!(e instanceof w)&&"string"!=typeof e)throw new Error("Invalid argument:"+typeof e);if(void 0===(i=e).destinationName)throw new Error(a(r.INVALID_ARGUMENT,[i.destinationName,"Message.destinationName"]));f.send(i)}else(i=new w(t)).destinationName=e,arguments.length>=3&&(i.qos=n),arguments.length>=4&&(i.retained=s),f.send(i)},this.disconnect=function(){f.disconnect()},this.getTraceLog=function(){return f.getTraceLog()},this.startTrace=function(){f.startTrace()},this.stopTrace=function(){f.stopTrace()},this.isConnected=function(){return f.connected}},Message:w}}(void 0!==t?t:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});return e},{get exports(){return n},set exports(e){n=e}}.exports=e();const s="client-"+g(),i="event/contribution/",o=i+"comment",r=i+"note",c=i+"message",a=i+"like",h=i+"highlight",l="$SYS/broker/clients",d=new n.Client("file:"==window.location.protocol||window.location.hostname.endsWith(".vercel.app")?"wss://mqtt.eclipseprojects.io/mqtt":"https:"==window.location.protocol?`wss://${window.location.hostname}:${window.location.port}/mqtt`:`ws://${window.location.hostname}:${window.location.port}/mqtt`,s),u={comments:{},messages:{}},f={deleteComment:function(e){if(confirm("Diesen Kommentar wirklich löschen?")){const e=this.dataset.id;m(o+"/"+e,"",!0)}},deleteMessage:function(e){confirm("Diese Nachricht wirklich löschen?")&&this.dataset.id&&m(c+"/"+this.dataset.id,"",!0)},highlightMessage:function(e){const t=this.dataset.id;if(t&&u.messages[t]){const e=JSON.stringify(u.messages[t]);return m(h,e)}},likeMessage:function(e){const t=this.dataset.id;if(t){let e=[];try{const t=("; "+document.cookie).split("; liked=");2==t.length&&(e=JSON.parse(t.pop().split(";").shift()))}catch(e){}if(-1==e.indexOf(t)&&(e.push(t),document.cookie="liked="+JSON.stringify(e),document.cookie="max-age=21600",m(a+"/"+t+"/"+s,"like",!0))){w("template-likes-loading","likes-"+t,{id:t})}}},sendComment:function(e){let t=this;(e instanceof KeyboardEvent&&"keypress"==e.type&&"Enter"==e.key&&t.value||"click"==e.type&&null!==(t=M(this))&&t.value)&&m(o+"/"+g(),t.value,!0)&&(t.value="")},sendNote:function(e){let t=this;(e instanceof KeyboardEvent&&"keypress"==e.type&&"Enter"==e.key||"click"==e.type&&null!==(t=M(this)))&&m(r,t.value,!0)&&(t.value="")},takeComment:function(e){const t=this.dataset.id;m(o+"/"+t,"",!0),S(t,u.comments[t].text)}};function g(){return(Number(String(Math.random()).slice(2))+Date.now()+Math.round(performance.now())).toString(36)}function p(e){const t=document.createElement("div");return t.append(e),t.innerHTML}function _(){d.onMessageArrived=I,d.onConnectionLost=v,y("Verbinde zum Server");try{d.connect({onSuccess:E,onFailure:v})}catch(e){console.log(e),y("FEHLER: Versuche die Seite neu zu laden.")}}function m(e,t){let n=arguments.length>2&&void 0!==arguments[2]&&arguments[2];try{return y(),d.send(e,t,1,n),!0}catch(e){console.log(e),y("FEHLER: Versuche es erneut.")}return!1}function y(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:void 0;const t=document.getElementById("toast");e?w("template-toast","toast-host",{text:e}):t&&t.remove()}function v(e){console.log(e),y("FEHLER: Neue Verbindung in 2 Sekunden."),window.setTimeout(_,2e3)}function E(){y();try{d.subscribe(r,{qos:1}),d.subscribe(c+"/+",{qos:1}),d.subscribe(h,{qos:1}),document.querySelector("body[data-is-admin]")&&(d.subscribe(o+"/+",{qos:1}),d.subscribe(a+"/+/+",{qos:1}),d.subscribe(l+"/#",{qos:1})),document.querySelectorAll("[data-bind-keypress]").forEach((e=>{try{e.addEventListener("keypress",f[e.dataset.bindKeypress])}catch(t){console.log("unable to bind function",e,t)}})),document.querySelectorAll("[data-bind-click]").forEach((e=>{try{e.addEventListener("click",f[e.dataset.bindClick])}catch(t){console.log("unable to bind function",e,t)}}))}catch(e){console.log(e),y("FEHLER: Versuche die Seite neu zu laden.")}}function I(e){try{if(e.destinationName.startsWith(l+"/"))!function(e,t){const n=document.getElementById("stats-clients");e==l+"/connected"&&null!==n&&(n.innerHTML=t)}(e.destinationName,e.payloadString);else if(e.destinationName.startsWith(o+"/")){!function(e,t){if(t){u.comments[e]={text:t};w("template-comment","comment-stream",{id:e,text:p(t),date:(new Date).toLocaleString()})}else delete u.comments[e],N("comment-"+e)}(e.destinationName.substr(o.length+1),e.payloadString)}else if(e.destinationName==r)!function(e){if(e){w("template-note","note-stream",{text:p(e)})}else N("note-top")}(e.payloadString);else if(e.destinationName.startsWith(c+"/")){!function(e,t){if(t){const n=JSON.parse(t);u.messages[e]={text:n.text,likes:n.likes};w("template-message","message-stream",{id:e,text:p(n.text),likes:p(n.likes)})}else delete u.messages[e],N("message-"+e)}(e.destinationName.substr(c.length+1),e.payloadString)}else if(e.destinationName.startsWith(a+"/")){const s=e.destinationName.substr(a.length+1).split("/");t=s[0],n=s[1],e.payloadString&&u.messages[t]&&(S(t,u.messages[t].text,u.messages[t].likes+1),m(a+"/"+t+"/"+n,"",!0))}else e.destinationName==h?function(e){const t=JSON.parse(e);t&&w("template-highlight","highlight-stream",t)}(e.payloadString):console.log(e.destinationName,e.payloadString)}catch(e){console.log("failed to hande message",e)}var t,n}function w(e,t,n){const s=document.getElementById(e),i=document.getElementById(t);if(null!==s&&null!==i){let e=s.innerHTML;for(const t in n)e=e.split("{{"+t+"}}").join(n[t]);const t=document.createElement("div");t.innerHTML=e;const o=t.firstElementChild;o.querySelectorAll("[data-bind-click]").forEach((e=>{try{e.addEventListener("click",f[e.dataset.bindClick])}catch(t){console.log("unable to bind function",e)}}));const r=document.getElementById(o.id);o.id&&null!==r?r.parentNode.replaceChild(o,r):i.appendChild(o);const c=o.parentNode.querySelectorAll("[data-orderid]");return c.length&&Array.from(c).sort(((e,t)=>Number.parseInt(t.dataset.orderid)-Number.parseInt(e.dataset.orderid))).forEach((e=>e.parentNode.appendChild(e))),o}}function M(e){const t=e.closest(".input-group");if(null!==t)return t.querySelector("input")}function N(e){const t=document.getElementById(e);null!==t&&t.remove()}function S(e,t){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0;const s=JSON.stringify({text:t,likes:n});return m(c+"/"+e,s,!0)}document.addEventListener("DOMContentLoaded",_);
//# sourceMappingURL=index.js.map
