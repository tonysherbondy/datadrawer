import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';

import InstructionTreeNode from '../../models/InstructionTreeNode';
import LoopInstruction from '../../models/LoopInstruction';
import IfInstruction from '../../models/IfInstruction';

class BlockInstructionItem extends React.Component {
  render() {
    let instruction = this.props.instruction;
    let selectionHandler = this.props.selectionHandler;
    let deleteHandler = this.props.deleteHandler;

    let selectedIds = _.pluck(this.props.selectedInstructions, 'id');
    let subInstructionIds = _.pluck(instruction.instructions, 'id');
    let isSubInstructionSelected =
      !_.isEmpty(_.intersection(selectedIds, subInstructionIds));

    let headerClass = classNames('sub-instruction-list-header', {
      'selected': this.props.isSelected,
      'sub-item-selected': isSubInstructionSelected
    });

    let subListClass = classNames('sub-instructions-list', {
      'selected': this.props.isSelected
    });

    let itemDescription = instruction.getUiSentence(
      this.context.actions.picture,
      this.props.picture,
      this.props.variableValues,
      this.props.shapeNameMap);

    let firstSubInstruction = _.first(instruction.instructions);

    return (
      <li className='instruction-list-item'>
        <div
          className={headerClass}
          onClick={selectionHandler.bind(null, firstSubInstruction)}>
          {itemDescription}
          <button type='button' className='delete-instruction'
            onClick={deleteHandler.bind(null, instruction)}>
            <i className='fa fa-close'></i>
          </button>
        </div>

        <InstructionList
          {...this.props}
          className={subListClass}
          instructions={instruction.instructions}/>

        <div
          className={headerClass}
          onClick={selectionHandler.bind(null, instruction)}>
          End <br/>
          Thumbnail placeholder
        </div>
      </li>
    );
  }
}
BlockInstructionItem.contextTypes = {
  actions: React.PropTypes.shape({
    drawingState: React.PropTypes.object.isRequired,
    picture: React.PropTypes.object.isRequired
  })
};


class InstructionItem extends React.Component {
  render() {
    let instruction = this.props.instruction;
    let selectionHandler = this.props.selectionHandler;
    let deleteHandler = this.props.deleteHandler;

    let itemClass = classNames('instruction-list-item', {
      dragging: this.props.isDragging,
      selected: this.props.isSelected
    });

    let itemDescription = instruction.getUiSentence(
      this.context.actions.picture,
      this.props.picture,
      this.props.variableValues,
      this.props.shapeNameMap);

    return (
      <li className={itemClass}
        data-id={instruction.id}
        key={instruction.id}
        draggable={true}
        onDragEnd={this.props.onDragEnd}
        onDragStart={this.props.onDragStart}
        onClick={selectionHandler.bind(null, instruction)}>
        {itemDescription}
        <button type='button' className='delete-instruction'
          onClick={deleteHandler.bind(null, instruction)}>
          <i className='fa fa-close'></i>
        </button>
      </li>
    );
  }
}

InstructionItem.contextTypes = {
  actions: React.PropTypes.shape({
    drawingState: React.PropTypes.object.isRequired,
    picture: React.PropTypes.object.isRequired
  })
};

InstructionItem.PropTypes = {
  onDragEnd: React.PropTypes.func.isRequired,
  onDragStart: React.PropTypes.func.isRequired
};


class InstructionList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dragInstructionId: null,
      dropzoneParentInstruction: null,
      dropzoneIndex: null
    };
  }

  render() {
    let getInstructionItems = (instruction, index) => {
      let selectedInstructions = this.props.selectedInstructions;
      let isSelected = _.some(selectedInstructions, {id: instruction.id});

      if (instruction instanceof LoopInstruction ||
          instruction instanceof IfInstruction) {
        return (
          <BlockInstructionItem
            key={index}
            {...this.props}
            instruction={instruction}
            selectionHandler={this.handleItemClick.bind(this)}
            deleteHandler={this.removeInstruction.bind(this)}
            isSelected={isSelected}/>
        );
      } else {
        return (
          <InstructionItem
            key={index}
            {...this.props}
            isDragging={instruction.id === this.state.dragInstructionId}
            onDragEnd={this.handleDragEnd.bind(this)}
            onDragStart={this.handleDragStart.bind(this, instruction)}
            instruction={instruction}
            selectionHandler={this.handleItemClick.bind(this)}
            deleteHandler={this.removeInstruction.bind(this)}
            isSelected={isSelected}/>
        );
      }
    };

    let listClass = this.props.className || 'instructions-list';

    return (
      <ul className={listClass} onDragOver={this.handleDragOver.bind(this)}>
        {this.props.instructions.map(getInstructionItems)}
      </ul>
    );
  }

  removeInstruction(instruction) {
    this.context.actions.picture.removeInstruction(this.props.picture, instruction);
  }

  handleDragEnd(evt) {
    console.log('drag end', evt);
    //this.setState({
        //dragInstructionId: null,
        //dropzoneParentInstruction: null,
        //dropzoneIndex: null
    //});
  }

  handleDragStart(instruction, evt) {
    evt.dataTransfer.effectAllowed = 'move';
    evt.dataTransfer.setData('text/html', evt.currentTarget);
    //this.setState({dragInstructionId: instruction.id});
  }

  handleDragOver(evt) {
    evt.preventDefault();
    if (evt.target.className === 'placeholder') {
      return;
    }
    this.over = evt.target;
    //console.log('drag over', this.over);
    //evt.target.parentNode.insertBefore(placeholder, evt.target);
  }

  handleItemClick(instruction, evt) {
    let {selectedInstructions} = this.props;
    // Only select range of instructions with shift key down and if we have only one other selected
    if (evt.shiftKey && selectedInstructions.length === 1) {
      // try to select range of instructions
      let {instructions} = this.props;
      // try either end of the instructions to see which side is bigger
      let prevInstruction = selectedInstructions[0];
      let between = InstructionTreeNode.findBetweenRange(instructions, prevInstruction, instruction);
      if (between.length && between.length > 0) {
        this.context.actions.drawingState.setSelectedInstructions(between);
      }
    } else {
      this.context.actions.drawingState.setSelectedInstruction(instruction);
    }
    evt.stopPropagation();
    evt.preventDefault();
  }
}

InstructionList.contextTypes = {
    actions: React.PropTypes.shape({
      drawingState: React.PropTypes.object.isRequired,
      picture: React.PropTypes.object.isRequired
    })
};

InstructionList.propTypes = {
  shapeNameMap: React.PropTypes.object.isRequired,
  picture: React.PropTypes.object.isRequired,
  instructions: React.PropTypes.array,
  variableValues: React.PropTypes.object
};

InstructionList.defaultProps = {
    instructions: [],
    variableValues: {}
};

export default InstructionList;
