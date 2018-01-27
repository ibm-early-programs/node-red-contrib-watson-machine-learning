/**
 * Copyright 2018 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
  const request = require('request');

  function start(msg, config) {
    return Promise.resolve();
  }

  function checkForParameters(msg, config) {
    return Promise.resolve();
  }

  function checkConnection(connectionNode) {
    var errorMsg = '';
    //var connString = settings.dbConnectionString();

    if (!connectionNode) {
      errorMsg = 'No Configuration Found';
    } else if (!connectionNode.host) {
      errorMsg = 'No Host set in configuration';
    } else if (!connectionNode.accesskey) {
      errorMsg = 'No Access Key set in configuration';
    } else if (!connectionNode.instanceid) {
      errorMsg = 'No Access Key set in configuration';
    } else if (!connectionNode.username) {
      errorMsg = 'No Username set in configuration';
    } else if (!connectionNode.password) {
      errorMsg = 'No Password set in configuration';
    }

    if (errorMsg) {
      return Promise.reject(errorMsg);
    }
    return Promise.resolve();
  }


  function getToken(connectionNode, token) {

    var p = new Promise(function resolver(resolve, reject){
      var token = null;
      var uriAddress = connectionNode.host + '/v3/identity/token';

      request({
        uri: uriAddress,
        method: 'GET',
        auth: {
          user: connectionNode.username,
          pass: connectionNode.password
  }
      }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          var b = JSON.parse(body);
          if (b.token) {
            token = 'Bearer ' + b.token;
          }
          resolve(token);
        } else if (error) {
          reject(error);
        } else {
          reject('Access Token Error ' + response.statusCode);
        }
      });
    });
    return p;
  }


  function doSomething() {
    var p = new Promise(function resolver(resolve, reject) {
      reject('nothing yet implemented');
    });
    return p;
  }

  function reportError(node, msg, err) {
    var messageTxt = err;
    if (err.error) {
      messageTxt = err.error;
    } else if (err.description) {
      messageTxt = err.description;
    } else if (err.message) {
      messageTxt = err.message;
    }
    node.status({ fill: 'red', shape: 'dot', text: messageTxt });

    msg.result = {};
    msg.result['error'] = err;
    node.error(messageTxt, msg);
  }

  function Node(config) {
    var node = this;
    RED.nodes.createNode(this, config);

    node.connectionNode = RED.nodes.getNode(config.connection);

    this.on('input', function(msg) {
      node.status({ fill: 'blue', shape: 'dot', text: 'initialising' });

      var connection = null;
      var token = null;

      start(msg, config)
        .then( () => {
          return checkForParameters(msg, config);
        })
        .then( () => {
          return checkConnection(node.connectionNode);
        })
        .then( () => {
          node.status({ fill: 'blue', shape: 'dot', text: 'requesting token' });
          return getToken(node.connectionNode);
        })
        .then( (t) => {
          token = t;
          node.status({ fill: 'blue', shape: 'dot', text: 'doing something' });
          return doSomething();
        })
        .then(function() {
          node.status({});
          node.send(msg);
        })
        .catch(function(err) {
          reportError(node,msg,err);
          node.send(msg);
        });

    });
  }

  RED.nodes.registerType('wml', Node, {
    credentials: {
      token: {
        type: 'text'
      }
    }
  });
};
