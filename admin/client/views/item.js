import React from 'react';
import ReactDOM from 'react-dom';
import Lists from '../stores/Lists';
import CreateForm from '../components/CreateForm';
import EditForm from '../components/EditForm';
import EditFormHeader from '../components/EditFormHeader';
import FlashMessages from '../components/FlashMessages';
import Footer from '../components/Footer';
import MobileNavigation from '../components/MobileNavigation';
import PrimaryNavigation from '../components/PrimaryNavigation';
import RelatedItemsList from '../components/RelatedItemsList';
import SecondaryNavigation from '../components/SecondaryNavigation';
import { Container, Spinner } from 'elemental';
import _ from 'lodash';
import xhr from 'xhr';

var ItemView = React.createClass({
  displayName: 'ItemView',
  getInitialState() {
    return {
      createIsOpen: false,
      itemData: null,
    };
  },
  componentDidMount() {
    this.loadItemData();
  },
  loadItemData() {
    this.props.list.loadItem(this.props.itemId, { drilldown: true }, (err, itemData) => {
      if (err || !itemData) {
        // TODO: nicer error handling
        console.log('Error loading item data', err);
        alert('Error loading data (details logged to console)');
        return;
      }
      this.setState({ itemData });
      this.setState({ messages: Keystone.messages });
    });
  },
  unlockEditorController({ fields = {}, callback }) {
    const adminPath = _.get(this.props, ['adminPath'], '/');
    const routePath = _.get(this.props, ['list', 'path'], '');
    xhr({
      method: 'post',
      body: JSON.stringify(Object.assign({
        action: 'leaveEditor'
      }, fields)),
      uri: `${adminPath}/${routePath}/${this.props.itemId}`,
      headers: {
        'Content-Type': 'application/json'
      }
    }, (e, res, body) => {
      if (!e) {
        console.log('Successfully leaving page.');
        callback && callback()
      } else {
        console.log('Leaving page in fail.');
      }
    });
  },
  setUpNotifyBeforeLeave() {
    if (Keystone.notifyBeforeLeave) {
      window.onbeforeunload = function (e) {
        e = e || window.event;
        if (e) {
          e.returnValue = 'You are about to leave this page. Are you sure?';
        }
        return 'You are about to leave this page. Are you sure?';
      };
    }
  },
  toggleCreate(visible) {
    this.setState({
      createIsOpen: visible,
    });
  },
  updateStatus(updating) {
    this.setState({
      updating: updating
    });
  },
  redirectPageBack() {
    const adminPath = _.get(this.props, ['adminPath'], '/');
    const routePath = _.get(this.props, ['list', 'path'], '');
    setTimeout(() => {
      window.location = `${adminPath}/${routePath}`;
    }, 5000)
    return `${adminPath}/${routePath}`;
  },
  renderRelationships() {
    let { relationships } = this.props.list;
    let keys = Object.keys(relationships);
    if (!keys.length) return;
    return (
      <div>
        <h2>Relationships</h2>
        {keys.map(key => {
          let relationship = relationships[key];
          let refList = Lists[relationship.ref];
          return <RelatedItemsList key={relationship.path} list={this.props.list} refList={refList} relatedItemId={this.props.itemId} relationship={relationship} />;
        })}
      </div>
    );
  },
  render() {
    if (!this.state.itemData || this.props.updating) return <div className="view-loading-indicator"><Spinner size="md" /></div>;
    if (Keystone.editorController) {
      let isEditing = _.get(Keystone, ['isEditing'], false);
      let currEditor = _.get(Keystone, ['currEditor'], '');
      let thisUserRole = _.get(this.props, ['user', 'role'])
      if (isEditing === true && thisUserRole !== 'admin') {
        const backPage = this.redirectPageBack();
        return <div className="view-loading-indicator">
          <FlashMessages messages={{ warning: [`This item is being edited by ${currEditor}, please try again later. This page will be redirect to ${backPage} in 5 seconds.`] }} />
        </div>
      } else {
        this.setUpNotifyBeforeLeave();
      }
    } else {
      this.setUpNotifyBeforeLeave();
    }

    return (
      <div className="keystone-wrapper">
        <header className="keystone-header">
          <MobileNavigation
            brand={this.props.brand}
            currentListKey={this.props.list.path}
            currentSectionKey={this.props.nav.currentSection.key}
            sections={this.props.nav.sections}
            signoutUrl={this.props.signoutUrl}
          />
          <PrimaryNavigation
            currentSectionKey={this.props.nav.currentSection.key}
            brand={this.props.brand}
            sections={this.props.nav.sections}
            signoutUrl={this.props.signoutUrl} />
          <SecondaryNavigation
            currentListKey={this.props.list.path}
            lists={this.props.nav.currentSection.lists} />
        </header>
        <div className="keystone-body">
          <EditFormHeader
            list={this.props.list}
            data={this.state.itemData}
            drilldown={this.state.itemDrilldown}
            toggleCreate={this.toggleCreate} />
          <Container>
            <CreateForm
              list={this.props.list}
              isOpen={this.state.createIsOpen}
              onCancel={() => this.toggleCreate(false)} />
            <FlashMessages
              messages={this.props.messages} />
            <EditForm
              list={this.props.list}
              unlockEditorController={this.unlockEditorController}
              data={this.state.itemData} />
            {this.renderRelationships()}
          </Container>
        </div>
        <Footer
          appversion={this.props.appversion}
          backUrl={this.props.backUrl}
          brand={this.props.brand}
          User={this.props.User}
          user={this.props.user}
          version={this.props.version} />
      </div>
    );
  },
});

ReactDOM.render(
  <ItemView
    appversion={Keystone.appversion}
    backUrl={Keystone.backUrl}
    brand={Keystone.brand}
    itemId={Keystone.itemId}
    list={Lists[Keystone.list.key]}
    messages={Keystone.messages}
    nav={Keystone.nav}
    signoutUrl={Keystone.signoutUrl}
    User={Keystone.User}
    user={Keystone.user}
    version={Keystone.version}
    adminPath={Keystone.adminPath}
    lists={Keystone.lists}
    itemData={{}}
    updating={false}
  />,
  document.getElementById('item-view')
);
