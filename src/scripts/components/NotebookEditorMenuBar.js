import React from 'react';
import classNames from 'classnames';

class NotebookEditorMenuBar extends React.Component {
  render() {
    let {isShowingPictures} = this.props;
    let userId = (<li key='userId'>{this.props.user.id}</li>);
    let listItems = [
      userId,
      this.getMenuBarItem('Pictures', this.handleTogglePictures, isShowingPictures),
      //this.getMenuBarItem('Shortcuts', this.handleToggleShortcuts, isShowingShortcuts)
      this.getMenuBarItem('Help', this.handleHelpClick)
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
            value={this.props.notebook.name} />
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

        <span className="logo">
          <i
            onClick={this.handleSaveNotebook.bind(this)}
            className="logo-button fa fa-floppy-o"></i>
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

  handleHelpClick() {
    window.open('http://tonysherbondy.github.io/datadrawer', '_blank');
  }

  handleNotebookNameChange(evt) {
    this.context.actions.picture.setNotebookName(evt.target.value);
  }

  handleNotebookFork() {
    this.context.actions.picture.forkNotebook({
      notebook: this.props.notebook,
      newOwnerId: this.props.user.id
    });
  }

  handleNewNotebook() {
    this.context.actions.picture.forkNotebook({
      notebookId: 'default',
      newOwnerId: this.props.user.id
    });
  }

  handleSaveNotebook() {
    this.context.actions.picture.saveNotebook(this.props.notebook);
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
  notebook: React.PropTypes.object.isRequired,
  isShowingShortcuts: React.PropTypes.bool.isRequired,
  isShowingPictures: React.PropTypes.bool.isRequired,
  onTogglePictures: React.PropTypes.func.isRequired,
  onToggleShortcuts: React.PropTypes.func.isRequired
};

export default NotebookEditorMenuBar;
