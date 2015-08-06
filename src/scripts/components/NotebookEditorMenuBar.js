import React from 'react';
import classNames from 'classnames';

class NotebookEditorMenuBar extends React.Component {
  render() {
    let {isShowingPictures} = this.props;
    let listItems = [
      this.getMenuBarItem('Pictures', this.handleTogglePictures, isShowingPictures)
      //this.getMenuBarItem('Shortcuts', this.handleToggleShortcuts, isShowingShortcuts)
    ];

    return (
      <div className="nav">
        <span className="logo">D2</span>
        <span className="logo">
          <input
            type="text"
            className="notebook-name-input"
            ref="notebookNameInput"
            onChange={this.handleNotebookNameChange.bind(this)}
            value={this.props.notebookName} />
        </span>
        <span className="logo">
          <i
            onClick={this.handleNotebookFork.bind(this)}
            className="logo-button fa fa-code-fork"></i>
        </span>
        <span className="logo">
          <i
            onClick={this.handleNewNotebook.bind(this)}
            className="logo-button fa fa-plus"></i>
        </span>
        <ul>
          {listItems}
        </ul>
        <div style={{clear: 'both'}}></div>
      </div>
    );
  }

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


  handleNotebookNameChange(evt) {
    this.context.actions.picture.setNotebookName(evt.target.value);
  }

  handleNotebookFork() {
    console.log('handle notebook fork');
  }

  handleNewNotebook() {
    console.log('handle new notebook');
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

NotebookEditorMenuBar.contextTypes = {
  actions: React.PropTypes.shape({
    picture: React.PropTypes.object.isRequired
  })
};

NotebookEditorMenuBar.propTypes = {
  notebookName: React.PropTypes.string.isRequired,
  isShowingShortcuts: React.PropTypes.bool.isRequired,
  isShowingPictures: React.PropTypes.bool.isRequired,
  onTogglePictures: React.PropTypes.func.isRequired,
  onToggleShortcuts: React.PropTypes.func.isRequired
};

export default NotebookEditorMenuBar;
