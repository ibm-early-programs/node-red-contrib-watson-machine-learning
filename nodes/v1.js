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

  function checkForParameters(msg, config, m, params) {
    var message = '';

    if (!m || '' === m) {
      message = 'Required mode has not been specified';
    }

    switch (m) {
      case 'getDeploymentDetails':
      case 'deleteDeployment':
      case 'runPrediction':
        if (!config.deployment) {
          message = 'No Deployment Specified for Deployment related Method';
        } else {
          params['deployment'] = config.deployment;
        }
         // deliberate no break
      case 'getModelDetails':
      case 'listModelMetrics':
      case 'listLearningIterations':
      case 'deleteModel':
      case 'listModelDeployments':
        if (!config.model) {
          message = 'No Model Specified for Model related Method';
        } else {
          params['model'] = config.model; //'f0ffd221-1390-49a7-bdf2-3cc86ed79ba7';//config.model;
        }
        break;
    }

    if (message){
      return Promise.reject(message);
    }
    return Promise.resolve();
  }

  function checkPayload(msg, m, params) {
    var message = '';
    switch (m) {
      case 'runPrediction':
        if (! msg.payload) {
          message = 'Values and Optional fields are required to run a prediction';
        } else if (Array.isArray(msg.payload)) {
          // allow values to be provided as a straight array.
          params.values = msg.payload;
        } else if ('object' !== typeof msg.payload) {
          message = 'Values need to be provided either as an array or as an object'
        } else {
          if (msg.payload.values) {
            params.values = msg.payload.values;
          } else {
            message = 'Can not run a prediction without values.'
          }
          if (msg.payload.fields) {
            params.fields = msg.payload.fields;
          }
        }
        break;
    }

    if (message){
      return Promise.reject(message);
    }
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
            //token = 'Bearer ' + b.token;
            token = b.token;
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

  function executeRequest(uriAddress, t) {
    var p = new Promise(function resolver(resolve, reject){
      request({
        uri: uriAddress,
        method: 'GET',
        auth: {
          'bearer': t
        }
      }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          data = JSON.parse(body);
          resolve(data);
        } else if (error) {
          reject(error);
        } else {
          reject('Error performing request ' + response.statusCode);
        }
      });
    });
    return p;
  }

  function executeDeleteRequest(uriAddress, t) {
    var p = new Promise(function resolver(resolve, reject){
      request({
        uri: uriAddress,
        method: 'DELETE',
        auth: {
          'bearer': t
        }
      }, (error, response, body) => {
        if (!error && (response.statusCode == 200 || response.statusCode == 204)) {
          resolve({'status':'ok'});
        } else if (error) {
          reject(error);
        } else {
          reject('Error performing request ' + response.statusCode);
        }
      });
    });
    return p;
  }

  function executePostRequest(uriAddress, t, p) {
    var p = new Promise(function resolver(resolve, reject){

      let dParams = {values : p.values};
      if (p.fields) {
        dParams.fields = p.fields;
      }

      request({
        headers: {
          'content-type' : 'application/json',
          'Accept': 'application/json'
        },
        uri: uriAddress,
        method: 'POST',
        auth: {
          'bearer': t
        },
        body: JSON.stringify(dParams)
      }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          data = JSON.parse(body);
          resolve(data);
        } else if (error) {
          reject(error);
        } else {
          let errordata = JSON.parse(body);
          //console.log(errordata);
          if (errordata.errors &&
                 Array.isArray(errordata.errors) &&
                 errordata.errors.length &&
                 errordata.errors[0].message) {
            reject('Error ' + response.statusCode + ' ' + errordata.errors[0].message);
          } else {
            reject('Error performing request ' + response.statusCode);
          }
        }
      });
    });
    return p;
  }

  function executeInstanceDetails(cn, t, params) {
    var uriAddress = cn.host + '/v3/wml_instances/' + cn.instanceid;
    return executeRequest(uriAddress, t);
  }

  function executeListModels(cn, t, params) {
    var uriAddress = cn.host + '/v3/wml_instances/' + cn.instanceid
                              + '/published_models';
    return executeRequest(uriAddress, t);
  }

  function executeGetModelDetails(cn, t, params) {
    var uriAddress = cn.host + '/v3/wml_instances/' + cn.instanceid
                              + '/published_models/' + params.model;
    return executeRequest(uriAddress, t);
  }

  function executeListModelMetrics(cn, t, params) {
    var uriAddress = cn.host + '/v3/wml_instances/' + cn.instanceid
                              + '/published_models/' + params.model
                              + '/evaluation_metrics';
    return executeRequest(uriAddress, t);
  }

  function executeListLearningIterations(cn, t, params) {
    var uriAddress = cn.host + '/v3/wml_instances/' + cn.instanceid
                              + '/published_models/' + params.model
                              + '/learning_iterations';
    return executeRequest(uriAddress, t);
  }

  function executeListModelDeployments(cn, t, params) {
    var uriAddress = cn.host + '/v3/wml_instances/' + cn.instanceid
                              + '/published_models/' + params.model
                              + '/deployments';
    return executeRequest(uriAddress, t);
  }

  function executeGetDeploymentDetails(cn, t, params) {
    var uriAddress = cn.host + '/v3/wml_instances/' + cn.instanceid
                              + '/published_models/' + params.model
                              + '/deployments/' + params.deployment;
    return executeRequest(uriAddress, t);
  }

  function executeDeleteDeployment(cn, t, params) {
    var uriAddress = cn.host + '/v3/wml_instances/' + cn.instanceid
                              + '/published_models/' + params.model
                              + '/deployments/' + params.deployment;
    return executeDeleteRequest(uriAddress, t);
  }

  function executeDeleteModel(cn, t, params) {
    var uriAddress = cn.host + '/v3/wml_instances/' + cn.instanceid
                              + '/published_models/' + params.model;
    return executeDeleteRequest(uriAddress, t);
  }

  function executeRunPrediction(cn, t, params) {
    var uriAddress = cn.host + '/v3/wml_instances/' + cn.instanceid
                              + '/published_models/' + params.model
                              + '/deployments/' + params.deployment
                              + '/online';

    return executePostRequest(uriAddress, t, params);
  }

  function executeUnknownMethod(cn, t, params) {
    return Promise.reject('Unable to process as unknown mode has been specified');
  }

  function executeMethod(method, cn, t, params) {
    var p = null;
    var f = null;
    const execute = {
      'instanceDetails' : executeInstanceDetails,
      'listModels': executeListModels,
      'getModelDetails' : executeGetModelDetails,
      'deleteModel' : executeDeleteModel,
      'listModelMetrics' : executeListModelMetrics,
      'listLearningIterations' : executeListLearningIterations,
      'listModelDeployments' : executeListModelDeployments,
      'getDeploymentDetails' : executeGetDeploymentDetails,
      'deleteDeployment' : executeDeleteDeployment,
      'runPrediction' : executeRunPrediction
    }

    f = execute[method] || executeUnknownMethod
    p = f(cn, t, params);
    return p;
  }

  function processResponse(msg, data) {
    msg.payload = data;
    return Promise.resolve();
  }

  function buildResponseArray(data) {
    models = [];
    resources = data.resources;

    if (resources) {
      resources.forEach((e) => {
        var m = {};
        if (e.metadata && e.metadata.guid) {
          m['guid'] = e.metadata.guid;
          if (e.entity && e.entity.name) {
            m['name'] = e.entity.name;
            models.push(m);
          }
        }
      });
    }

    return Promise.resolve(models);
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

  // API used by widget to fetch available models
  RED.httpAdmin.get('/wml/models', function (req, res) {
    var connection = req.query.cn;
    var cn = RED.nodes.getNode(connection);
    var myToken = null;
    var params = {};

    checkConnection(cn)
      .then( () => {
        return getToken(cn);
      })
      .then( (t) => {
        myToken = t;
        return executeMethod('listModels', cn, myToken, params);
      })
      .then( (data) => {
        return buildResponseArray(data);
      })
      .then( (models) => {
        res.json({models:models});
      })
      .catch(function(err) {
        res.json({error:'Not able to fetch models'});
      });
  });

  // API used by widget to fetch available deployments for a model
  RED.httpAdmin.get('/wml/deployments', function (req, res) {
    var connection = req.query.cn;
    var model = req.query.model;
    var cn = RED.nodes.getNode(connection);
    var myToken = null;
    var params = {};

    params.model = model;

    checkConnection(cn)
      .then( () => {
        return getToken(cn);
      })
      .then( (t) => {
        myToken = t;
        return executeMethod('listModelDeployments', cn, myToken, params);
      })
      .then( (data) => {
        return buildResponseArray(data);
      })
      .then( (deployments) => {
        res.json({deployments:deployments});
      })
      .catch(function(err) {
        res.json({error:'Not able to fetch deployments'});
      });
  });


  function Node(config) {
    var node = this;
    RED.nodes.createNode(this, config);

    node.connectionNode = RED.nodes.getNode(config.connection);

    this.on('input', function(msg) {
      node.status({ fill: 'blue', shape: 'dot', text: 'initialising' });

      var connection = null;
      var token = null;
      var method = config['wml-mode'];
      var params = {};

      start(msg, config)
        .then( () => {
          return checkForParameters(msg, config, method, params);
        })
        .then( () => {
          return checkPayload(msg, method, params);
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
          node.status({ fill: 'blue', shape: 'dot', text: 'executing' });
          return executeMethod(method, node.connectionNode, token, params);
        })
        .then( (data) => {
          node.status({ fill: 'blue', shape: 'dot', text: 'processing response' });
          return processResponse(msg, data);
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
