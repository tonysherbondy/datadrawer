import _ from 'lodash';
import Immutable from 'immutable';

import Expression from '../models/Expression';
import DataVariable from '../models/DataVariable';
import DrawCircleInstruction from '../models/DrawCircleInstruction';
import DrawLineInstruction from '../models/DrawLineInstruction';
import DrawPathInstruction from '../models/DrawPathInstruction';
import DrawRectInstruction from '../models/DrawRectInstruction';
import DrawTextInstruction from '../models/DrawTextInstruction';
import DrawPictureInstruction from '../models/DrawPictureInstruction';
import ExtendPathInstruction from '../models/ExtendPathInstruction';
import IfInstruction from '../models/IfInstruction';
import LoopInstruction from '../models/LoopInstruction';
import MoveInstruction from '../models/MoveInstruction';
import RotateInstruction from '../models/RotateInstruction';
import ScaleInstruction from '../models/ScaleInstruction';
import Picture from '../models/Picture';
import Notebook from '../models/Notebook';

function pictureSerializer() {
  let instructionConstructorToTypeMap = Immutable.Map([
      [DrawCircleInstruction, 'draw.circle'],
      [DrawLineInstruction, 'draw.line'],
      [DrawPathInstruction, 'draw.path'],
      [DrawRectInstruction, 'draw.rect'],
      [DrawTextInstruction, 'draw.text'],
      [DrawPictureInstruction, 'draw.picture'],
      [ExtendPathInstruction, 'adjust.extend_path'],
      [MoveInstruction, 'adjust.move'],
      [RotateInstruction, 'adjust.rotate'],
      [ScaleInstruction, 'adjust.scale'],
      [IfInstruction, 'flow.if'],
      [LoopInstruction, 'flow.loop']
    ]);
  let typeToInstructionConstructorMap =
    instructionConstructorToTypeMap.toKeyedSeq().flip().toMap();

  function fragmentToJson(fragment) {
    if (fragment.id) { // variable or shape property
      let json = Object.create(null);
      if (fragment.prop) { // shape property
        json.shape = fragment.id;
        // TODO: come up with a better name than prop
        json.prop = fragment.prop;
      } else { // variable
        json.variable = fragment.id;
        if (fragment.asVector) {
          json.asVector = true;
        }
      }
      return json;
    }

    return fragment;
  }

  // TODO: add serialization/deserialization for shape properties ({id, prop});
  function fragmentFromJson(json) {
    if (json.variable) {
      let ret = {id: json.variable};
      if (json.asVector) {
        ret.asVector = true;
      }
      return ret;
    }

    if (json.shape) {
      return {id: json.shape, prop: json.prop};
    }

    return json;
  }

  function expressionToJson(expression) {
    return expression.fragments.map(fragmentToJson);
  }

  function expressionFromJson(json) {
    // expect json to be an array here
    let fragments = json.map(fragmentFromJson);
    return new Expression(fragments);
  }

  // TODO: Verify that we don't need to store 'isReadOnly' or 'prop' because they
  // come from on variables that only appear in the ShapeDataList.
  // These variables are generated on the fly and never get persisted
  // They get converted to expressions as soon as they are dragged into an
  // instruction.
  // TODO: should is isVector/isRow be computed dynamically?
  function variableToJson(variable) {
    let json = Object.create(null);

    Object.assign(json, {
      id: variable.id,
      name: variable.name,
      definition: expressionToJson(variable.definition)
    });

    if (variable.isRow) {
      json.isVector = true;
    }

    return json;
  }

  function variableFromJson(json) {
    let definition = expressionFromJson(json.definition);
    return new DataVariable({
      name: json.name,
      id: json.id,
      definition: definition,
      isRow: json.isVector
    });
  }


  function pointToJson(point) {
    let json = Object.create(null);
    if (point.id) {
      json.shape = point.id;
      json.point = point.point;
    } else {
      // TODO: point.x and point.y should always be expressions
      // this check is required for now because drawinstruction.from is not an
      // expression right now
      if (point.x instanceof Expression) {
        json.x = expressionToJson(point.x);
        json.y = expressionToJson(point.y);
      } else {
        json.x = [point.x];
        json.y = [point.y];
      }
    }
    return json;
  }

  function pointFromJson(json, extractCoordinates) {
    let ret = Object.create(null);
    if (json.shape) {
      ret.id = json.shape;
      ret.point = json.point;
    } else {
      if (extractCoordinates) {
        ret.x = _.first(json.x);
        ret.y = _.first(json.y);
      } else {
        ret.x = expressionFromJson(json.x);
        ret.y = expressionFromJson(json.y);
      }
    }
    return ret;
  }

  // TODO: fix toMagnets and fromMagnets
  // these should be computed dynamically
  function setDrawInstructionProperties(json, instruction) {
    json.name = instruction.name;

    // TODO: potential issue here for paths, probably don't want to store the from
    json.from = pointToJson(instruction.from);

    if (instruction.isGuide) {
      json.isGuide = true;
    }

    // fill
    // stroke
    // stokeWidth
    // fontSize
    // textAnchor
    instruction.propertyVariables.forEach(propVar => {
      json[propVar.name] = expressionToJson(propVar.definition);
    });

    switch (json.type) {
      case 'draw.circle':
        setCircleProperties(json, instruction);
        break;
      case 'draw.line':
        setLineProperties(json, instruction);
        break;
      case 'draw.path':
        setPathProperties(json, instruction);
        break;
      case 'draw.rect':
        setRectProperties(json, instruction);
        break;
      case 'draw.text':
        setTextProperties(json, instruction);
        break;
      case 'draw.picture':
        setPictureInstructionProperties(json, instruction);
        break;
    }
  }

  function readDrawInstructionProperties(props, json) {
    props.name = json.name;

    // paths don't use a from
    if (json.from) {
      props.from = pointFromJson(json.from, true);
    }

    props.isGuide = json.isGuide;

    let propNames = ['fill', 'stroke', 'strokeWidth', 'fontSize', 'textAnchor'];
    props.propertyVariables = propNames.filter(varName => {
      return json[varName] !== undefined && json[varName] !== null;
    }).map(varName => {
      return variableFromJson({name: varName, definition: json[varName]});
    });

    switch (json.type) {
      case 'draw.circle':
        readCircleProperties(props, json);
        break;
      case 'draw.line':
        readLineProperties(props, json);
        break;
      case 'draw.path':
        readPathProperties(props, json);
        break;
      case 'draw.rect':
        readRectProperties(props, json);
        break;
      case 'draw.text':
        readTextProperties(props, json);
        break;
      case 'draw.picture':
        readPictureInstructionProperties(props, json);
        break;
    }
  }

  function setCircleProperties(json, instruction) {
    if (instruction.to) {
      json.to = pointToJson(instruction.to);
    } else {
      json.radius = expressionToJson(instruction.radius);
    }
  }

  function readCircleProperties(props, json) {
    if (json.to) {
      props.to = pointFromJson(json.to);
    } else {
      props.radius = expressionFromJson(json.radius);
    }
  }

  function setLineProperties(json, instruction) {
    if (instruction.to) {
      json.to = pointToJson(instruction.to);
    } else {
      // TODO: change to better names (perhaps horizontal/vertical)
      json.width = expressionToJson(instruction.width);
      json.height = expressionToJson(instruction.height);
    }
  }

  function readLineProperties(props, json) {
    if (json.to) {
      props.to = pointFromJson(json.to);
    } else {
      props.width = expressionFromJson(json.width);
      props.height = expressionFromJson(json.height);
    }
  }

  function pathPointToJson(point) {
    let ret = pointToJson(point);
    if (point.isLine) {
      ret.segmentType = 'line';
    } else if (point.isArc) {
      ret.segmentType = 'arc';
    }

    return ret;
  }

  function pathPointFromJson(json, extractCoordinates) {
    let ret = pointFromJson(json, extractCoordinates);
    if (json.segmentType === 'line') {
      ret.isLine = true;
    } else if (json.segmentType === 'arc') {
      ret.isArc = true;
    }
    return ret;
  }

  function setPathProperties(json, instruction) {
    // TODO: change the default in DrawPathInstruction to open
    if (instruction.isClosed) {
      json.isClosed = true;
    }

    let points = instruction.to.map(pathPointToJson);
    json.points = [json.from, ...points];
    delete json.from;
  }

  function readPathProperties(props, json) {
    if (json.isClosed) {
      props.isClosed = true;
    } else {
      props.isClosed = false;
    }

    let [startPoint, ...points] = json.points;

    // TODO: remove second argument to pointFromJson
    // once we let from point support expressions
    props.from = pathPointFromJson(startPoint, true);
    props.to = points.map(p => pathPointFromJson(p, false));
  }

  function setRectProperties(json, instruction) {
    // has the same dimension properties as line
    setLineProperties(json, instruction);
  }

  function readRectProperties(props, json) {
    readLineProperties(props, json);
  }

  function setTextProperties(json, instruction) {
    json.text = expressionToJson(instruction.text);
    setLineProperties(json, instruction);
  }

  function readTextProperties(props, json) {
    props.text = expressionFromJson(json.text);
    readLineProperties(props, json);
  }

  // TODO: should include the actual instruction list instead of just a
  // reference to the picture
  function setPictureInstructionProperties(json, instruction) {
    setRectProperties(json, instruction);
    json.pictureId = instruction.pictureId;
    json.variables = instruction.pictureVariables.map(variableToJson);
    // maps ids in the orignal picture to ids in the above list of variables
    json.variableIdMap = instruction.pictureIdToDrawIdMap;
  }

  function readPictureInstructionProperties(props, json) {
    readRectProperties(props, json);
    props.pictureId = json.pictureId;
    props.pictureVariables = json.variables.map(variableFromJson);
    props.pictureIdToDrawIdMap = json.variableIdMap;
  }

  // TODO: fix toMagnets
  function setAdjustInstructionProperties(json, instruction) {
    // shape and handle (pivot point) to adjust
    json.shape = instruction.shape.id;
    json.point = instruction.point;

    switch (json.type) {
      case 'adjust.extend_path':
        setExtendPathProperties(json, instruction);
        break;
      case 'adjust.move':
        setMoveProperties(json, instruction);
        break;
      case 'adjust.rotate':
        setRotateProperties(json, instruction);
        break;
      case 'adjust.scale':
        setScaleProperties(json, instruction);
        break;
    }
  }

  function readAdjustInstructionProperties(props, json) {
    // shape and handle (pivot point) to adjust
    props.shape = {id: json.shape};
    props.point = json.point;

    switch (json.type) {
      case 'adjust.extend_path':
        readExtendPathProperties(props, json);
        break;
      case 'adjust.move':
        readMoveProperties(props, json);
        break;
      case 'adjust.rotate':
        readRotateProperties(props, json);
        break;
      case 'adjust.scale':
        readScaleProperties(props, json);
        break;
    }
  }

  // most of these should probably have 'prop' to adjust
  // should also have 'to'

  function setExtendPathProperties(json, instruction) {
    if (instruction.to) {
      json.to = pointToJson(instruction.to);
    } else {
      json.to = pointToJson({x: instruction.x, y: instruction. y});
    }

    if (instruction.isArc) {
      json.to.segmentType = 'arc';
      json.to.radius = expressionToJson(instruction.arcRadius);
    } else if (instruction.isLine) {
      json.to.segmentType = 'line';
    }
  }

  function readExtendPathProperties(props, json) {
    let point = pathPointFromJson(json.to);
    if (point.id) {
      props.to = point;
    } else {
      props.x = point.x;
      props.y = point.y;
    }

    if (json.to.segmentType === 'arc') {
      props.isArc = true;
      props.arcRadius = expressionFromJson(json.to.radius);
    } else if (json.to.segmentType === 'line') {
      props.isLine = true;
    }
  }

  // TODO: (separate this out into move shape and and reshape (move point))
  function setMoveProperties(json, instruction) {
    if (instruction.to) {
      json.to = pointToJson(instruction.to);
    } else {
      json.to = pointToJson({x: instruction.x, y: instruction. y});
    }

    // TODO these should be no longer necessary once we separate out reshape
    json.isReshape = instruction.isReshape;
    json.axis = instruction.axis;
  }

  function readMoveProperties(props, json) {
    let point = pointFromJson(json.to);
    if (point.id) {
      props.to = point;
    } else {
      props.x = point.x;
      props.y = point.y;
    }

    props.isReshape = json.isReshape;
    props.axis = json.axis;
  }

  // TODO should probably be able to snap to while rotating?
  function setRotateProperties(json, instruction) {
    json.by = expressionToJson(instruction.to);
  }

  function readRotateProperties(props, json) {
    props.to = expressionFromJson(json.by);
  }

  // TODO should probably be able to snap to point?
  function setScaleProperties(json, instruction) {
    json.prop = instruction.prop;
    json.by = expressionToJson(instruction.to);
  }

  function readScaleProperties(props, json) {
    props.prop = json.prop;
    props.to = expressionFromJson(json.by);
  }

  function setLoopProperties(json, instruction) {
    json.instructions = instruction.instructions.map(instructionToJson);
    // TODO allow expressions here
    if (instruction.count !== 'max') {
      json.count = instruction.count;
    }
  }

  function readLoopProperties(props, json) {
    props.instructions = json.instructions.map(instructionFromJson);
    props.count = json.count;
  }

  function setIfProperties(json, instruction) {
    json.condition = expressionToJson(instruction.condition);
    json.instructions = instruction.instructions.map(instructionToJson);
  }

  function readIfProperties(props, json) {
    props.condition = expressionFromJson(json.condition);
    props.instructions = json.instructions.map(instructionFromJson);
  }

  function instructionToJson(instruction) {
    let json = Object.create(null);
    json.id = instruction.id;
    json.type =
      instructionConstructorToTypeMap.get(instruction.constructor);

    if (json.type.startsWith('draw')) {
      setDrawInstructionProperties(json, instruction);
    }

    if (json.type.startsWith('adjust')) {
      setAdjustInstructionProperties(json, instruction);
    }

    if (json.type === 'flow.loop') {
      setLoopProperties(json, instruction);
    }

    if (json.type === 'flow.if') {
      setIfProperties(json, instruction);
    }

    return json;
  }


  function instructionFromJson(json) {
    let props = {id: json.id};

    if (json.type.startsWith('draw')) {
      readDrawInstructionProperties(props, json);
    }

    if (json.type.startsWith('adjust')) {
      readAdjustInstructionProperties(props, json);
    }

    if (json.type === 'flow.loop') {
      readLoopProperties(props, json);
    }

    if (json.type === 'flow.if') {
      readIfProperties(props, json);
    }

    let constructor = typeToInstructionConstructorMap.get(json.type);
    return new constructor(props);
  }

  function pictureToJson(picture) {
    let picturejson = Object.create(null);
    // expects picture.variables and picture.instructions to be plain JS arrays
    picturejson.id = picture.id;
    picturejson.googleSpreadsheetId = picture.googleSpreadsheetId;
    picturejson.variables = picture.variables.map(variableToJson);
    picturejson.instructions = picture.instructions.map(instructionToJson);
    return picturejson;
  }

  function pictureFromJson(picturejson) {
    let instructions = (picturejson.instructions || []).map(instructionFromJson);
    let variables = (picturejson.variables || []).map(variableFromJson);
    let {id, googleSpreadsheetId} = picturejson;
    return new Picture({id, googleSpreadsheetId, instructions: instructions, variables: variables});
  }

  function notebookToJson(notebook) {
    let notebookJson = Object.create(null);
    notebookJson.id = notebook.id;
    notebookJson.name = notebook.name;
    notebookJson.pictures = notebook.pictures.map(pictureToJson).toJS();
    return notebookJson;
  }

  function notebookFromJson(notebookJson) {
    let {id, name} = notebookJson;
    let pictures = _.mapValues((notebookJson.pictures || {}), pictureFromJson);
    return new Notebook({id, name, pictures});
  }

  return {pictureToJson, pictureFromJson, notebookFromJson, notebookToJson};
}

export default pictureSerializer;
