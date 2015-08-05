import React from 'react';

class NotebookEditorMenuBar extends React.Component {
  render() {
    return (
      <div className="nav">
        <ul>
          <li><a className="active" href="#" onClick={this.handleTogglePictures.bind(this)}>Pictures</a></li>
          <li><a href="#" onClick={this.handleToggleShortcuts.bind(this)}>Shortcuts</a></li>
        </ul>
      </div>
    );
  }

  handleTogglePictures(evt) {
    console.log('toggle pictures');
    evt.preventDefault();
  }

  handleToggleShortcuts(evt) {
    console.log('toggle shortcuts');
    evt.preventDefault();
  }

}

export default NotebookEditorMenuBar;
