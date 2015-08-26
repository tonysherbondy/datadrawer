import React, { PropTypes } from 'react';
import { DragSource, DropTarget } from 'react-dnd';

const style = {
  padding: '0.5rem 1rem',
  marginBottom: '.5rem',
  backgroundColor: 'white',
  cursor: 'move'
};

const instructionSource = {
  beginDrag(props) {
    return { id: props.instruction.id };
  }
};

const instructionTarget = {
  hover(props, monitor) {
    const draggedId = monitor.getItem().id;

    if (draggedId !== props.instruction.id) {
      props.moveInstruction(draggedId, props.instruction.id);
    }
  }
};

@DropTarget('instruction', instructionTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))
@DragSource('instruction', instructionSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
class DnDInstructionListItem {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    instruction: PropTypes.object.isRequired,
    moveInstruction: PropTypes.func.isRequired
  };

  render() {
    const { instruction, isDragging, connectDragSource, connectDropTarget } = this.props;
    const opacity = isDragging ? 0 : 1;
    const padding = style.padding;

    return connectDragSource(connectDropTarget(
      <div style={{ ...style, opacity, padding }}>
        {instruction.id}
      </div>
    ));
  }
}

export default DnDInstructionListItem;
