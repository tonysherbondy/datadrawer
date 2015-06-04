import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import PictureActions from '../../actions/PictureActions';
import DrawingStateActions from '../../actions/DrawingStateActions';
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

class InstructionItem extends React.Component {
  render() {
    let instruction = this.props.instruction;
    let selectionHandler = this.props.selectionHandler;
    let deleteHandler = this.props.deleteHandler;

    let itemClass = classNames('instruction-list-item', {
      selected: this.props.isSelected
    });

    let itemDescription = instruction.getUiSentence(
      this.props.picture,
      this.props.variableValues,
      this.props.shapeNameMap);

    return (
      <li className={itemClass}
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


export default class InstructionList extends React.Component {
  removeInstruction(instruction) {
    PictureActions.removeInstruction(this.props.picture, instruction);
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
            instruction={instruction}
            selectionHandler={this.handleItemClick.bind(this)}
            deleteHandler={this.removeInstruction.bind(this)}
            isSelected={isSelected}/>
        );
      }
    };

    let listClass = this.props.className || 'instructions-list';

    return (
      <ul className={listClass}>
        {this.props.instructions.map(getInstructionItems)}
      </ul>
    );
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
        DrawingStateActions.setSelectedInstructions(between);
      }
    } else {
      DrawingStateActions.setSelectedInstruction(instruction);
    }
    evt.stopPropagation();
    evt.preventDefault();
  }

}

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
