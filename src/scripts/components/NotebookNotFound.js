import React from 'react';

class NotebookNotFound extends React.Component {
  render() {
    return (
      <div className="notebook-not-found">
        <h2>Notebook Not Found</h2>
        <span className="button">
          Create a new notebook
          <i onClick={this.handleCreateNotebook.bind(this)}
            className="fa fa-code-fork">
          </i>
        </span>
      </div>
    );
  }

  handleCreateNotebook() {
    this.context.actions.picture.forkNotebook({
      notebookId: 'default',
      newOwnerId: this.props.user.id
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.apiState === 'loaded') {
      let firstPicture = nextProps.notebook.pictures.first();
      this.context.router.transitionTo(`/notebook/${nextProps.notebook.id}/picture/${firstPicture.id}/`);
    }
  }
}

NotebookNotFound.propTypes = {
  apiState: React.PropTypes.string.isRequired,
  notebook: React.PropTypes.object.isRequired
};

NotebookNotFound.contextTypes = {
  actions: React.PropTypes.shape({
    picture: React.PropTypes.object.isRequired
  }),
  router: React.PropTypes.func.isRequired
};

export default NotebookNotFound;
