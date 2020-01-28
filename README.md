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

When running a prediction `msg.payload` needs to be select either to an arrays of
an array of values, or an object containing and array of array of values,
against which to run predictions against.
eg. To run a prediction against a model expecting 6 decimal numbers.
````
msg.payload = [[16.4, 48.3, 30, 75.4, 28.9, 20]];
````
To run a prediction for multiple set of values
````
msg.payload = [[16.4, 48.3, 30, 75.4, 28.9, 20], [13.4, 38.3, 30, 75.4, 18.9, 25]];
````
or
````
msg.payload = {values : [[16.4, 48.3, 30, 75.4, 28.9, 20], [13.4, 38.3, 30, 75.4, 18.9, 25]] };
````
or
````
msg.payload = {"input_data":
                [
                  {
                    "fields" :
                      ["COLUMN1","COLUMN2","COLUMN3","COLUMN4","COLUMN5","COLUMN6"],
                    "values" :
                      [
                        [16.4, 48.3, 30, 75.4, 28.9, 20],
                        [2.99, 7.06, 70, 8.05, 87.7, 32]
                      ]
                  }
                ]
              };
````
in this way the fields parameter can also be provided.

### Output
For all modes
the output is a json object on `msg.payload`.

### Sample flow
````
[{"id":"387df186.0af95e","type":"wml","z":"13c3d65d.f8df2a","name":"Service Instance Details","connection":"dc0fd3e4.694f9","wml-mode":"instanceDetails","model":"d59e949a-9d16-45bf-8468-23c87b8a2397","x":343,"y":66,"wires":[["b4c1ee2b.eb003"]]},{"id":"2654db85.e447e4","type":"inject","z":"13c3d65d.f8df2a","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":128,"y":66,"wires":[["387df186.0af95e"]]},{"id":"ffdb4dc4.04ba3","type":"debug","z":"13c3d65d.f8df2a","name":"","active":true,"console":"false","complete":"true","x":925,"y":356,"wires":[]},{"id":"a976e852.d2a5b8","type":"inject","z":"13c3d65d.f8df2a","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":128,"y":156,"wires":[["dc18bb5b.375578"]]},{"id":"dc18bb5b.375578","type":"wml","z":"13c3d65d.f8df2a","name":"List Published Models","connection":"dc0fd3e4.694f9","wml-mode":"listModels","x":340,"y":156,"wires":[["9ffaab5d.196408"]]},{"id":"79c28673.233658","type":"inject","z":"13c3d65d.f8df2a","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":129,"y":485,"wires":[["67235ac7.322fe4"]]},{"id":"3a55d6c1.b5350a","type":"wml","z":"13c3d65d.f8df2a","name":"Run Prediction","connection":"dc0fd3e4.694f9","wml-mode":"runPrediction","model":"0c71e666-48d2-4a2d-896e-55ee73f452bd","deployment":"8188398c-26ca-415f-a8e6-187f678cacad","x":522,"y":484,"wires":[["ab857681.0fb0e8"]]},{"id":"fec54484.87ef08","type":"link in","z":"13c3d65d.f8df2a","name":"wml out","links":["b4c1ee2b.eb003","9ffaab5d.196408","ab857681.0fb0e8","b41981d5.e8ab8","ce045be.8ed7ca8","33584e81.15c3b2","a298a5b3.029188","bf66c40c.6fec78","1a19a650.0ba9aa","d2774ad6.1e67e8"],"x":770,"y":355,"wires":[["ffdb4dc4.04ba3"]]},{"id":"b4c1ee2b.eb003","type":"link out","z":"13c3d65d.f8df2a","name":"","links":["fec54484.87ef08"],"x":506,"y":66,"wires":[]},{"id":"9ffaab5d.196408","type":"link out","z":"13c3d65d.f8df2a","name":"","links":["fec54484.87ef08"],"x":514,"y":156,"wires":[]},{"id":"ab857681.0fb0e8","type":"link out","z":"13c3d65d.f8df2a","name":"","links":["fec54484.87ef08"],"x":645,"y":484,"wires":[]},{"id":"8aeb12fe.804ae","type":"comment","z":"13c3d65d.f8df2a","name":"Instance Method","info":"","x":122,"y":28,"wires":[]},{"id":"1d9dbdb8.b71822","type":"comment","z":"13c3d65d.f8df2a","name":"Published Model Methods","info":"","x":153,"y":114,"wires":[]},{"id":"2add66b7.a61dca","type":"inject","z":"13c3d65d.f8df2a","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":130,"y":192,"wires":[["c18c9c20.d9fa3"]]},{"id":"c18c9c20.d9fa3","type":"wml","z":"13c3d65d.f8df2a","name":"Get Model Details","connection":"dc0fd3e4.694f9","wml-mode":"getModelDetails","model":"d8308d26-e143-41f3-a44c-7808a890e7bb","x":329,"y":192,"wires":[["b41981d5.e8ab8"]]},{"id":"b41981d5.e8ab8","type":"link out","z":"13c3d65d.f8df2a","name":"","links":["fec54484.87ef08"],"x":514,"y":192,"wires":[]},{"id":"a939c355.36dfc","type":"inject","z":"13c3d65d.f8df2a","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":131,"y":229,"wires":[["d299eba8.44c828"]]},{"id":"d299eba8.44c828","type":"wml","z":"13c3d65d.f8df2a","name":"List Model Metrics","connection":"dc0fd3e4.694f9","wml-mode":"listModelMetrics","model":"d8308d26-e143-41f3-a44c-7808a890e7bb","x":328,"y":229,"wires":[["ce045be.8ed7ca8"]]},{"id":"ce045be.8ed7ca8","type":"link out","z":"13c3d65d.f8df2a","name":"","links":["fec54484.87ef08"],"x":513,"y":229,"wires":[]},{"id":"7708da2.131bb24","type":"inject","z":"13c3d65d.f8df2a","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":130,"y":265,"wires":[["79859cf2.7fc6e4"]]},{"id":"79859cf2.7fc6e4","type":"wml","z":"13c3d65d.f8df2a","name":"List Model Iterations","connection":"dc0fd3e4.694f9","wml-mode":"listLearningIterations","model":"d8308d26-e143-41f3-a44c-7808a890e7bb","x":336,"y":265,"wires":[["33584e81.15c3b2"]]},{"id":"33584e81.15c3b2","type":"link out","z":"13c3d65d.f8df2a","name":"","links":["fec54484.87ef08"],"x":513,"y":265,"wires":[]},{"id":"9e9e2fea.e816d","type":"comment","z":"13c3d65d.f8df2a","name":"Model Deployment Methods","info":"","x":165,"y":310,"wires":[]},{"id":"e00e6b9b.d7ae18","type":"wml","z":"13c3d65d.f8df2a","name":"List Model Deployments","connection":"dc0fd3e4.694f9","wml-mode":"listModelDeployments","model":"d8308d26-e143-41f3-a44c-7808a890e7bb","x":349,"y":353,"wires":[["a298a5b3.029188"]]},{"id":"dd6eb62.df54c48","type":"inject","z":"13c3d65d.f8df2a","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":130,"y":353,"wires":[["e00e6b9b.d7ae18"]]},{"id":"a298a5b3.029188","type":"link out","z":"13c3d65d.f8df2a","name":"","links":["fec54484.87ef08"],"x":517,"y":353,"wires":[]},{"id":"4e607ddc.6162d4","type":"inject","z":"13c3d65d.f8df2a","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":130,"y":392,"wires":[["8e38aca.483185"]]},{"id":"8e38aca.483185","type":"wml","z":"13c3d65d.f8df2a","name":"Get Deployment Details","connection":"dc0fd3e4.694f9","wml-mode":"getDeploymentDetails","model":"d8308d26-e143-41f3-a44c-7808a890e7bb","deployment":"6d653718-085d-41b9-bcf2-b70fbe1ce4c1","x":346,"y":392,"wires":[["bf66c40c.6fec78"]]},{"id":"bf66c40c.6fec78","type":"link out","z":"13c3d65d.f8df2a","name":"","links":["fec54484.87ef08"],"x":516,"y":392,"wires":[]},{"id":"bd882201.d07d3","type":"comment","z":"13c3d65d.f8df2a","name":"Scoring - Prediction","info":"","x":137,"y":439,"wires":[]},{"id":"67235ac7.322fe4","type":"function","z":"13c3d65d.f8df2a","name":"Build Payload Values","func":"msg.payload = [[16.4, 48.3, 30, 75.4, 28.9, 20]];\nreturn msg;","outputs":1,"noerr":0,"x":315,"y":485,"wires":[["3a55d6c1.b5350a"]]},{"id":"3b21d2d6.5daa8e","type":"comment","z":"13c3d65d.f8df2a","name":"Delete","info":"","x":95.5,"y":538,"wires":[]},{"id":"74df78c0.29db18","type":"inject","z":"13c3d65d.f8df2a","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":129,"y":580,"wires":[["10a97ba.20d9784"]]},{"id":"99887b47.19d928","type":"inject","z":"13c3d65d.f8df2a","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":129,"y":619,"wires":[["b6b3955d.97e708"]]},{"id":"10a97ba.20d9784","type":"wml","z":"13c3d65d.f8df2a","name":"Delete Model","connection":"","wml-mode":"deleteModel","model":"","deployment":"","modelhidden":"","deploymenthidden":"","x":290.5,"y":580,"wires":[["1a19a650.0ba9aa"]]},{"id":"b6b3955d.97e708","type":"wml","z":"13c3d65d.f8df2a","name":"Delete Model Deployment","connection":"","wml-mode":"deleteDeployment","model":"","deployment":"","modelhidden":"","deploymenthidden":"","x":331.5,"y":619,"wires":[["d2774ad6.1e67e8"]]},{"id":"1a19a650.0ba9aa","type":"link out","z":"13c3d65d.f8df2a","name":"","links":["fec54484.87ef08"],"x":511.5,"y":579,"wires":[]},{"id":"d2774ad6.1e67e8","type":"link out","z":"13c3d65d.f8df2a","name":"","links":["fec54484.87ef08"],"x":514.5,"y":619,"wires":[]},{"id":"dc0fd3e4.694f9","type":"wml-config","z":"","host":"https://ibm-watson-ml.mybluemix.net","accesskey":"","instanceid":"","name":"Initial"}]
````

## Contributing
For simple typos and fixes please just raise an issue pointing out our mistakes. If you need to raise a pull request please read our [contribution guidelines](https://github.com/ibm-early-programs/node-red-contrib-watson-machine-learning/blob/master/CONTRIBUTING.md) before doing so.

## Copyright and license

Copyright 2018, 2020 IBM Corp. under the Apache 2.0 license.
