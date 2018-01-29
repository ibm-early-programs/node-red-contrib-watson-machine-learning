# node-red-contrib-watson-machine-learning

[Node-RED](http://nodered.org) This is a node-red wrapper for the GET and POST data retrieval and run prediction methods of the [Watson Machine Learning](http://watson-ml-api.mybluemix.net) service.

## Install
Use the manage palette option to install this node

## Usage
This node allows you to run predictions against a deployed
machine learning model.

## Configuration
To make a connection to your Watson Machine Learning service the node will need a connection configuration. Create a configuration by double selecting a node.

### Input
For most modes the node `msg.payload` is not required. The node needs to be configured
to select model and deployment. A list of published models and deployments is
automatically retrieved by the node, making use of the API.

When running a prediction `msg.filename` needs to be select to an arrays of
an array of values, against which to run predictions against.
eg. To run a prediction against a model expecting 6 decimal numbers.
````
msg.payload = [[16.4, 48.3, 30, 75.4, 28.9, 20]];
````
To run a prediction for multiple set of values/
````
msg.payload = [[16.4, 48.3, 30, 75.4, 28.9, 20], [13.4, 38.3, 30, 75.4, 18.9, 25]];
````

### Output
For all modes
the output is a json object on `msg.payload`.

### Sample flow
````
[{"id":"7a87528.7c525ac","type":"wml","z":"9c44485d.da1c88","name":"Service Instance Details","connection":"9a34b421.d79d78","wml-mode":"instanceDetails","model":"d59e949a-9d16-45bf-8468-23c87b8a2397","x":299,"y":58,"wires":[["29f8574.5f449a8"]]},{"id":"96d435a1.fa1ee8","type":"inject","z":"9c44485d.da1c88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":108,"y":59,"wires":[["7a87528.7c525ac"]]},{"id":"3d23ae66.11ab72","type":"debug","z":"9c44485d.da1c88","name":"","active":true,"console":"false","complete":"true","x":717,"y":165,"wires":[]},{"id":"f7277aac.b2e7d8","type":"inject","z":"9c44485d.da1c88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":100,"y":149,"wires":[["edd6831.4ae878"]]},{"id":"edd6831.4ae878","type":"wml","z":"9c44485d.da1c88","name":"List Published Models","connection":"9a34b421.d79d78","wml-mode":"listModels","x":292,"y":147,"wires":[["e3a61e8e.a5f3b"]]},{"id":"34120a83.5a2c66","type":"inject","z":"9c44485d.da1c88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":101,"y":478,"wires":[["c766d82c.cfedb8"]]},{"id":"20e432ef.68fb4e","type":"wml","z":"9c44485d.da1c88","name":"Run Prediction","connection":"9a34b421.d79d78","wml-mode":"runPrediction","model":"0c71e666-48d2-4a2d-896e-55ee73f452bd","deployment":"8188398c-26ca-415f-a8e6-187f678cacad","x":500,"y":471,"wires":[["cdaf313.859a6d"]]},{"id":"137fda3d.e712f6","type":"link in","z":"9c44485d.da1c88","name":"wml out","links":["29f8574.5f449a8","e3a61e8e.a5f3b","cdaf313.859a6d","bdfc125e.27ff2","a83961db.bfe4b","7f7d41c1.04836","24e5b732.d44498","327bd02b.b4a45"],"x":627,"y":168,"wires":[["3d23ae66.11ab72"]]},{"id":"29f8574.5f449a8","type":"link out","z":"9c44485d.da1c88","name":"","links":["137fda3d.e712f6"],"x":443,"y":58,"wires":[]},{"id":"e3a61e8e.a5f3b","type":"link out","z":"9c44485d.da1c88","name":"","links":["137fda3d.e712f6"],"x":441,"y":144,"wires":[]},{"id":"cdaf313.859a6d","type":"link out","z":"9c44485d.da1c88","name":"","links":["137fda3d.e712f6"],"x":617,"y":471,"wires":[]},{"id":"37e56d5d.f9d472","type":"comment","z":"9c44485d.da1c88","name":"Instance Method","info":"","x":96,"y":24,"wires":[]},{"id":"1d09b235.18810e","type":"comment","z":"9c44485d.da1c88","name":"Published Model Methods","info":"","x":127,"y":113,"wires":[]},{"id":"264fd25b.09f99e","type":"inject","z":"9c44485d.da1c88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":102,"y":185,"wires":[["b0071451.df6338"]]},{"id":"b0071451.df6338","type":"wml","z":"9c44485d.da1c88","name":"Get Model Details","connection":"9a34b421.d79d78","wml-mode":"getModelDetails","model":"d8308d26-e143-41f3-a44c-7808a890e7bb","x":278,"y":183,"wires":[["bdfc125e.27ff2"]]},{"id":"bdfc125e.27ff2","type":"link out","z":"9c44485d.da1c88","name":"","links":["137fda3d.e712f6"],"x":438,"y":182,"wires":[]},{"id":"cc2b1d8c.b114e","type":"inject","z":"9c44485d.da1c88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":105,"y":223,"wires":[["4a6e0173.29d45"]]},{"id":"4a6e0173.29d45","type":"wml","z":"9c44485d.da1c88","name":"List Model Metrics","connection":"9a34b421.d79d78","wml-mode":"listModelMetrics","model":"d8308d26-e143-41f3-a44c-7808a890e7bb","x":279,"y":221,"wires":[["a83961db.bfe4b"]]},{"id":"a83961db.bfe4b","type":"link out","z":"9c44485d.da1c88","name":"","links":["137fda3d.e712f6"],"x":436,"y":218,"wires":[]},{"id":"688054b9.81944c","type":"inject","z":"9c44485d.da1c88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":100,"y":261,"wires":[["d25a8a4b.1af8f8"]]},{"id":"d25a8a4b.1af8f8","type":"wml","z":"9c44485d.da1c88","name":"List Model Iterations","connection":"9a34b421.d79d78","wml-mode":"listLearningIterations","model":"d8308d26-e143-41f3-a44c-7808a890e7bb","x":290,"y":259,"wires":[["7f7d41c1.04836"]]},{"id":"7f7d41c1.04836","type":"link out","z":"9c44485d.da1c88","name":"","links":["137fda3d.e712f6"],"x":450,"y":266,"wires":[]},{"id":"2817d2eb.52649e","type":"comment","z":"9c44485d.da1c88","name":"Model Deployment Methods","info":"","x":143,"y":303,"wires":[]},{"id":"3cc7397.e059dc6","type":"wml","z":"9c44485d.da1c88","name":"List Model Deployments","connection":"9a34b421.d79d78","wml-mode":"listModelDeployments","model":"d8308d26-e143-41f3-a44c-7808a890e7bb","x":301,"y":344,"wires":[["24e5b732.d44498"]]},{"id":"bd864490.9afbb8","type":"inject","z":"9c44485d.da1c88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":102,"y":346,"wires":[["3cc7397.e059dc6"]]},{"id":"24e5b732.d44498","type":"link out","z":"9c44485d.da1c88","name":"","links":["137fda3d.e712f6"],"x":452,"y":344,"wires":[]},{"id":"bbe0b902.4f2508","type":"inject","z":"9c44485d.da1c88","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":103,"y":385,"wires":[["b652c8b.bfd6738"]]},{"id":"b652c8b.bfd6738","type":"wml","z":"9c44485d.da1c88","name":"Get Deployment Details","connection":"9a34b421.d79d78","wml-mode":"getDeploymentDetails","model":"d8308d26-e143-41f3-a44c-7808a890e7bb","deployment":"6d653718-085d-41b9-bcf2-b70fbe1ce4c1","x":306,"y":385,"wires":[["327bd02b.b4a45"]]},{"id":"327bd02b.b4a45","type":"link out","z":"9c44485d.da1c88","name":"","links":["137fda3d.e712f6"],"x":451,"y":382,"wires":[]},{"id":"265af18e.a4938e","type":"comment","z":"9c44485d.da1c88","name":"Scoring - Prediction","info":"","x":126,"y":432,"wires":[]},{"id":"c766d82c.cfedb8","type":"function","z":"9c44485d.da1c88","name":"Build Payload Values","func":"msg.payload = [[16.4, 48.3, 30, 75.4, 28.9, 20]];\nreturn msg;","outputs":1,"noerr":0,"x":287,"y":480,"wires":[["20e432ef.68fb4e"]]},{"id":"9a34b421.d79d78","type":"wml-config","z":"","host":"https://ibm-watson-ml.mybluemix.net","accesskey":"","instanceid":"","name":"Initial"}]
````

## Contributing
For simple typos and fixes please just raise an issue pointing out our mistakes. If you need to raise a pull request please read our [contribution guidelines](https://github.com/ibm-early-programs/node-red-contrib-watson-machine-learning/blob/master/CONTRIBUTING.md) before doing so.

## Copyright and license

Copyright 2018 IBM Corp. under the Apache 2.0 license.
