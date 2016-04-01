'use strict';

import { Entity } from 'draft-js';
import ImageSelector from '../../../../admin/client/components/ImageSelector';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import React from 'react';

export default class ImageBlock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        editMode: false,
        image: null
    };
    this.onValueChange = this._onValueChange.bind(this);
    this.handleClick = this._handleClick.bind(this);
    this.handleFinish = this._handleFinish.bind(this);
    this.handleRemove = this._handleRemove.bind(this);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

    this._remove = () => {
      this.props.blockProps.onRemove(this.props.block.getKey());
    };
  }

  _finishEdit() {
      this.props.blockProps.onFinishEdit(this.props.block.getKey(), this.state.image);
  }

  _handleClick() {
      if (this.state.editMode) {
          return;
      }

      this.setState({
          editMode: true,
      });
  }

  _handleFinish() {
      this.setState({
          editMode: false
      });
  }

  _onValueChange(value) {
      const image = Array.isArray(value) && value[0] ? value[0] : null;
      const entityKey = this.props.block.getEntityAt(0);
      Entity.mergeData(entityKey, {url: image && image.url, description: image && image.description});
      this.setState({
        editMode: false,
        image: image
      }, this._finishEdit);
  }

  _getValue() {
      const entityKey = this.props.block.getEntityAt(0);
      return entityKey ? Entity.get(entityKey).getData(): null;
  }

  _handleRemove(evt) {
      this.props.onRemove(this.props.block.getKey());
  }

  _renderImageSelector(props) {
      return (
          <ImageSelector {...props}/>
      );
  }

  render() {
    let { editMode, image } = this.state;
    image = image || this._getValue();
    if (!image) {
        return null;
    }

    const EditBlock = editMode ? this._renderImageSelector({
          apiPath: 'images',
          doSelectMany: false,
          isSelectionOpen: true,
          onChange: this.onValueChange,
          onFinish: this.handleFinish,
          selectedImages: [image]
    }) : null;

    return (
      <figure
        contentEditable={false}
        >
        <img src={image.url} width="100%" onClick={this.handleClick} style={{cursor: "pointer"}}/>
        <figcaption>{image.description}</figcaption>
        {EditBlock}
      </figure>
    );
  }
}
