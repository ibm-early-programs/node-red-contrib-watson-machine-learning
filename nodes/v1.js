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
  const debug = require('debug')('node-red-contrib-watson-machine-learning');
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
      case 'getDeploymentDetailsV4':
      case 'deleteDeploymentV4':
      case 'runPrediction':
        if (!config.deployment) {
          message = 'No Deployment Specified for Deployment related Method';
        } else {
          params['deployment'] = config.deployment;
        }
        break;
      case 'getDeploymentDetails':
      case 'deleteDeployment':
        if (!config.deployment) {
          message = 'No Deployment Specified for Deployment related Method';
        } else {
          params['deployment'] = config.deployment;
        }
         // deliberate no break
      case 'getModelDetails':
      case 'getModelDetailsV4':
      case 'listModelMetrics':
      case 'listLearningIterations':
      case 'deleteModel':
      case 'deleteModelV4':
      case 'listModelDeployments':
        if (!config.model) {
          message = 'No Model Specified for Model related Method';
        } else {
          params['model'] = config.model;
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
          message = 'Input_Data or Values and Optional fields are required to run a prediction';
        } else if (Array.isArray(msg.payload)) {
          if (0 === msg.payload.length) {
            message = 'zero length array is not valid input data for a prediction';
          } else if (Array.isArray(msg.payload[0])) {
            // allow values to be provided as a straight array, of arrays
            params.values = msg.payload;
          } else {
            // wrap the single array values in another array
            params.values = [msg.payload];
          }

        } else if ('object' !== typeof msg.payload) {
          message = 'Input_Data needs to be provided either as an array or as an object'
        } else if (msg.payload.input_data) {
          params.input_data = msg.payload.input_data;
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
    return p = new Promise(function resolver(resolve, reject) {
      var errorMsg = '';
      //var connString = settings.dbConnectionString();

      if (!connectionNode) {
        errorMsg = 'No Configuration Found';
      } else if (!connectionNode.host) {
        errorMsg = 'No Host set in configuration';
      } else if (!connectionNode.apikey) {
        errorMsg = 'No API Key set in configuration';
      } else if (!connectionNode.instanceid) {
        errorMsg = 'No Access Key set in configuration';
      }

      if (errorMsg) {
        return reject(errorMsg);
      }
      return resolve();
    });
  }

  function getToken(connectionNode, token) {
    return new Promise(function resolver(resolve, reject) {
      var token = null;
      //let uriAddress = connectionNode.host + '/v3/identity/token';
      let uriAddress = "https://iam.bluemix.net/oidc/token";
      let IBM_Cloud_IAM_uid = "bx";
      let IBM_Cloud_IAM_pwd = "bx";

      request({
        uri: uriAddress,
        method: 'POST',
        auth: {
          user: IBM_Cloud_IAM_uid,
          pass: IBM_Cloud_IAM_pwd
        },
        headers : { "Content-Type"  : "application/x-www-form-urlencoded" },
        body    : "apikey=" + connectionNode.apikey + "&grant_type=urn:ibm:params:oauth:grant-type:apikey"
      }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          var b = JSON.parse(body);
          if (b.access_token) {
            //token = 'Bearer ' + b.token;
            token = b.access_token;
          }
          resolve(token);
        } else if (error) {
          reject(error);
        } else {
          debug('Access Token Error:', error);
          reject('Access Token Error ' + response.statusCode);
        }
      });
    });
  }

  function executeRequest(uriAddress, t) {
    return executeRequestV4Style(uriAddress, t, null);
  }

  function executeRequestV4Style(uriAddress, t, instanceid) {
    return new Promise(function resolver(resolve, reject) {
      let reqObject = {
        uri: uriAddress,
        method: 'GET',
        auth: {
          'bearer': t
        }
      };

      if (instanceid) {
        reqObject.headers = {'ML-Instance-ID' : instanceid};
      }

      request(reqObject, (error, response, body) => {
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
  }

  function executeDeleteRequest(uriAddress, t) {
    return executeDeleteRequestV4Style(uriAddress, t, null);
  }

  function executeDeleteRequestV4Style(uriAddress, t, instanceid) {
    return new Promise(function resolver(resolve, reject){
      let reqObject = {
        uri: uriAddress,
        method: 'DELETE',
        auth: {
          'bearer': t
        }
      };

      if (instanceid) {
        reqObject.headers = {'ML-Instance-ID' : instanceid};
      }

      request(reqObject, (error, response, body) => {
        if (!error && (response.statusCode == 200 || response.statusCode == 204)) {
          resolve({'status':'ok'});
        } else if (error) {
          reject(error);
        } else {
          reject('Error performing request ' + response.statusCode);
        }
      });
    });
  }

  function executePostRequest(uriAddress, t, p) {
    return executePostRequestV4Style(uriAddress, t, p, null);
  }


  function executePostRequestV4Style(uriAddress, t, p, instanceid) {
    return new Promise(function resolver(resolve, reject) {

      let reqObject = {
        headers: {
          'content-type' : 'application/json',
          'Accept': 'application/json'
        },
        uri: uriAddress,
        method: 'POST',
        auth: {
          'bearer': t
        },
        body: JSON.stringify(p)
      };

      if (instanceid) {
        reqObject.headers = {'ML-Instance-ID' : instanceid};
      }

      request(reqObject, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          data = JSON.parse(body);
          resolve(data);
        } else if (error) {
          reject(error);
        } else {
          try {
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
          } catch (e) {
            reject(body);
          }

        }
      });
    });
  }

  function executeInstanceDetails(cn, t, params) {
    var uriAddress = cn.host + '/v3/wml_instances/' + cn.instanceid;
    return executeRequest(uriAddress, t);
  }

  function checkForModels(data) {
    if (data && data.resources &&
          Array.isArray(data.resources) &&
          (0 < data.resources.length)) {
      return true;
    }
    return false;
  }

  function fetchModels(cn, myToken) {
    return new Promise(function resolver(resolve, reject) {
      // Try V3 first
      executeMethod('listModels', cn, myToken, {})
      .then((data) => {
        if (checkForModels(data)) {
          resolve(data);
        } else {
          // If no models are found then try V4
          return executeMethod('listModelsV4', cn, myToken, {})
        }
      })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      })
    });
  }

  function checkForDeployments(data) {
    if (data && data.resources &&
          Array.isArray(data.resources) &&
          (0 < data.resources.length)) {
      return true;
    }
    return false;
  }


  function fetchDeployments(cn, myToken) {
    return new Promise(function resolver(resolve, reject) {
      // Try V3 first
      executeMethod('listAllDeployments', cn, myToken, {})
      .then((data) => {
        if (checkForDeployments(data)) {
          resolve(data);
        } else {
          // If no deployments are found then try V4
          return executeMethod('listAllDeploymentsV4', cn, myToken, {});
        }
      })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      })
    });
  }

  function executeListModels(cn, t, params) {
    var uriAddress = cn.host + '/v3/wml_instances/' + cn.instanceid
                              + '/published_models';
    return executeRequest(uriAddress, t);
  }

  function executeListModelsV4(cn, t, params) {
    var uriAddress = cn.host + '/v4/models';
    return executeRequestV4Style(uriAddress, t, cn.instanceid);
  }

  function executeGetModelDetails(cn, t, params) {
    var uriAddress = cn.host + '/v3/wml_instances/' + cn.instanceid
                              + '/published_models/' + params.model;
    return executeRequest(uriAddress, t);
  }

  function executeGetModelDetailsV4(cn, t, params) {
    var uriAddress = cn.host + '/v4/models/' + params.model;
    return executeRequestV4Style(uriAddress, t, cn.instanceid);
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

  function executeListAllDeployments(cn, t, params) {
    var uriAddress = cn.host + '/v3/wml_instances/' + cn.instanceid
                              + '/deployments';
    return executeRequest(uriAddress, t);
  }

  function executeListAllDeploymentsV4(cn, t, params) {
    var uriAddress = cn.host + '/v4/deployments';
    return executeRequestV4Style(uriAddress, t, cn.instanceid);
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

  function executeGetDeploymentDetailsV4(cn, t, params) {
    var uriAddress = cn.host + '/v4/deployments/' + params.deployment;
    return executeRequestV4Style(uriAddress, t, cn.instanceid);
  }

  function executeDeleteDeployment(cn, t, params) {
    var uriAddress = cn.host + '/v3/wml_instances/' + cn.instanceid
                              + '/published_models/' + params.model
                              + '/deployments/' + params.deployment;
    return executeDeleteRequest(uriAddress, t);
  }

  function executeDeleteDeploymentV4(cn, t, params) {
    var uriAddress = cn.host + '/v4/deployments/' + params.deployment;
    return executeDeleteRequestV4Style(uriAddress, t, cn.instanceid);
  }

  function executeDeleteModel(cn, t, params) {
    var uriAddress = cn.host + '/v3/wml_instances/' + cn.instanceid
                              + '/published_models/' + params.model;
    return executeDeleteRequest(uriAddress, t);
  }

  function executeDeleteModelV4(cn, t, params) {
    var uriAddress = cn.host + '/v4/models/' + params.model;
    return executeDeleteRequestV4Style(uriAddress, t, cn.instanceid);
  }

  function executeRunPrediction(cn, t, params) {
    // A V4 Type Prediction will work for both V3 and V4 deployments
    let uriAddress = cn.host + '/v4/deployments/'
                        + params.deployment + '/predictions';
    let V4Params = {};

    if (params.input_data) {
      v4Params = {'input_data' : params.input_data};
    } else {
      let dParams = {values : params.values};
      if (params.fields) {
        dParams.fields = params.fields;
      }
      v4Params = {'input_data' : [dParams]};
    }


    return executePostRequestV4Style(uriAddress, t, v4Params, cn.instanceid);
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
      'listModelsV4': executeListModelsV4,
      'getModelDetails' : executeGetModelDetails,
      'getModelDetailsV4' : executeGetModelDetailsV4,
      'deleteModel' : executeDeleteModel,
      'deleteModelV4' : executeDeleteModelV4,
      'listModelMetrics' : executeListModelMetrics,
      'listLearningIterations' : executeListLearningIterations,
      'listAllDeployments': executeListAllDeployments,
      'listAllDeploymentsV4': executeListAllDeploymentsV4,
      'listModelDeployments' : executeListModelDeployments,
      'getDeploymentDetails' : executeGetDeploymentDetails,
      'getDeploymentDetailsV4' : executeGetDeploymentDetailsV4,
      'deleteDeployment' : executeDeleteDeployment,
      'deleteDeploymentV4' : executeDeleteDeploymentV4,
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
    let models = [];
    let resources = data.resources;

    if (resources) {
      resources.forEach((e) => {
        var m = {};
        if (e.metadata && e.metadata.guid) {
          m['guid'] = e.metadata.guid;
          if (e.entity && e.entity.name) {
            m['name'] = e.entity.name;
            if (e.entity.published_model && e.entity.published_model.guid) {
              m['model'] = e.entity.published_model.guid;
            }

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
    let connection = req.query.cn;
    let cn = RED.nodes.getNode(connection);
    let myToken = null;

    debug('Fetching Models');

    checkConnection(cn)
      .then( () => {
        return getToken(cn);
      })
      .then( (t) => {
        myToken = t;
        return fetchModels(cn, myToken)
      })
      .then( (data) => {
        return buildResponseArray(data);
      })
      .then( (models) => {
        res.json({models:models});
      })
      .catch(function(err) {
        debug('/wml/models Error:', err);
        res.json({error:'Not able to fetch models'});
      });
  });

  // API used by widget to fetch available deployments for a model
  RED.httpAdmin.get('/wml/deployments', function (req, res) {
    var connection = req.query.cn;
    //var model = req.query.model;
    var cn = RED.nodes.getNode(connection);
    var myToken = null;
    //var params = {};

    //params.model = model;

    checkConnection(cn)
      .then( () => {
        return getToken(cn);
      })
      .then( (t) => {
        myToken = t;
        return fetchDeployments(cn, myToken);
        // return executeMethod('listModelDeployments', cn, myToken, params);
      })
      .then( (data) => {
        return buildResponseArray(data);
      })
      .then( (deployments) => {
        res.json({deployments:deployments});
      })
      .catch(function(err) {
        debug('/wml/deployments Error:', err);
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
