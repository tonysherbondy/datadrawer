import evaluateJs from './evaluateJs';

export default function computeVariableValues(variables) {
  // Compute Variable Values turns variables into JS and then evaluates the JS
  // Take the immutable dataVariable definitions
  let varDoneMap = {};
  let isDone = v => varDoneMap[v.id];
  let toJsQueue = [];
  let jsLines = [];

  function processQueue() {
    // Assume cycles are prevented at construction
    while (toJsQueue.length > 0) {
      let top = toJsQueue.pop();

      // Skip this variable if its done
      if (!isDone(top)) {

        // Get the actual variable
        let topV = variables.filter(v => v.id === top.id)[0];

        // See if we have any dependent variables to push onto the queue
        let depVars = topV.getDependentVariables();
        // Don't add any that are already done
        let toAdd = depVars.filter(v => !isDone(v));

        if (toAdd.length > 0) {
          toJsQueue.push(top, ...toAdd);
        } else {
          varDoneMap[top.id] = 'done';
          jsLines.push(topV.getJsCode());
        }
      }

    }
  }

  variables.forEach(variable => {
    if (!isDone(variable)) {
      toJsQueue.push(variable);
      processQueue();
    }
  });

  let jsCode = jsLines.join('\n');
  let variableValues = {data: {}};
  evaluateJs(jsCode, variableValues);

  return {jsCode, variableValues};

}
