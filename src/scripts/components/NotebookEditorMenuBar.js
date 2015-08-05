import React from 'react';
import classNames from 'classnames';

class NotebookEditorMenuBar extends React.Component {
  getMenuBarItem(name, handler, isActive) {
    return (
      <li key={name}>
        <a
          className={classNames({active: isActive})}
          href="#"
          onClick={handler.bind(this)}>
            {name}
        </a>
      </li>
    );
  }

  render() {
    let {isShowingPictures} = this.props;
    let listItems = [
      this.getMenuBarItem('Pictures', this.handleTogglePictures, isShowingPictures)
      //this.getMenuBarItem('Shortcuts', this.handleToggleShortcuts, isShowingShortcuts)
    ];

    return (
      <div className="nav">
        <span className="logo">DataDrawer</span>
        <span className="logo">
          <input type="text" value={this.props.notebookName} />
        </span>
        <ul>
          {listItems}
        </ul>
        <div style={{clear: 'both'}}></div>
      </div>
    );
  }

  handleTogglePictures(evt) {
    this.props.onTogglePictures();
    evt.preventDefault();
  }

  handleToggleShortcuts(evt) {
    this.props.onToggleShortcuts();
    evt.preventDefault();
  }

}

NotebookEditorMenuBar.propTypes = {
  notebookName: React.PropTypes.string.isRequired,
  isShowingShortcuts: React.PropTypes.bool.isRequired,
  isShowingPictures: React.PropTypes.bool.isRequired,
  onTogglePictures: React.PropTypes.func.isRequired,
  onToggleShortcuts: React.PropTypes.func.isRequired
};

export default NotebookEditorMenuBar;
