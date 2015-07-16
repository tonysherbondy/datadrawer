import _ from 'lodash';
import Immutable from 'immutable';
import evaluateJs from './evaluateJs';

//function indexBy(iterable, indexer) {
  //return iterable.toSeq().groupBy(indexer).map(i => i.first()).toMap();
//}

// MOVE TO EXPRESSION PACKAGE?
function fragmentIsVariable(fragment) {
  return Immutable.Map.isMap(fragment) && fragment.has('variable');
}

function directDependencies(variable) {
  return variable.get('definition').filter(fragmentIsVariable).
    map(fragment => fragment.get('variable')).toSet();
}

function topologicalSortByDependency(variables) {
  // map from variable => Set of direct dependencies
  let unprocessedDependencies = variables.toSeq().
    groupBy(v => v).map(vList => directDependencies(vList.first()));

  // queue of variables to process
  // start with variables that have no dependencies
  let queue = unprocessedDependencies.
    filter(deps => deps.isEmpty()).toKeyedSeq().flip().toList();

  // we only want to add variables to the queue once
  // this keeps track of which ones have been added
  let queued = queue.toSet();

  let ret = Immutable.List();

  while (!queue.isEmpty()) {
    let variable = queue.first();
    queue = queue.shift();
    ret = ret.push(variable);

    // remove the current variable from any list of unprocess dependencies
    unprocessedDependencies =
      unprocessedDependencies.map(deps => deps.remove(variable.get('id')));

    // we will enqueue any vars that no longer have any dependencies
    // and weren't already enqueued
    let toAdd = unprocessedDependencies.filter(deps => deps.isEmpty()).
      toKeyedSeq().flip().filter(v => !queued.has(v)).toList();

    queue = queue.concat(toAdd);
    queued = queued.union(toAdd);
  }

  return ret;
}

// TODO: don't remember why or whether index is needed here
function jsCodeForFragment(fragment) {
  if (_.isString(fragment)) {
    return fragment;
  } else {
    let varString = `{id: '${fragment.get('variable')}', asVector: ${fragment.get('asVector')}}`;
    return `utils.getData(${varString})`; // , ${index})`;
  }
}

function initializationCodeForVariable(variable) {
  let lhs = `variables.data.${variable.get('id')}`;
  let rhs = variable.get('definition').map(jsCodeForFragment).join('');
  return `${lhs} = ${rhs};`;
}

export default function computeVariableValues(variables) {
  let sortedVars = topologicalSortByDependency(variables);

  let jsLines = sortedVars.map(initializationCodeForVariable);
  let jsCode = jsLines.join('\n');
  let variableValues = {data: {}};
  evaluateJs(jsCode, variableValues);

  return {jsCode, variableValues};

}
