import React from 'react';

import { connect } from 'react-redux';

import { PageHeader, Well, Alert, Row, Col, ButtonToolbar, Button, ButtonGroup, Glyphicon, ControlLabel } from 'react-bootstrap';

import _ from 'lodash';
import Moment from 'moment';
import Promise from 'bluebird';

import * as Action from '../actionTypes';
import * as Api from '../api';
import * as Constant from '../constants';
import store from '../store';

import CheckboxControl from '../components/CheckboxControl.jsx';
import DateControl from '../components/DateControl.jsx';
import DropdownControl from '../components/DropdownControl.jsx';
import Favourites from '../components/Favourites.jsx';
import FilterDropdown from '../components/FilterDropdown.jsx';
import FormInputControl from '../components/FormInputControl.jsx';
import MultiDropdown from '../components/MultiDropdown.jsx';
import Spinner from '../components/Spinner.jsx';
import EquipmentTable from './EquipmentTable.jsx';

import { toZuluTime } from '../utils/date';

var Equipment = React.createClass({
  propTypes: {
    currentUser: React.PropTypes.object,
    equipmentList: React.PropTypes.object,
    localAreas: React.PropTypes.object,
    districtEquipmentTypes: React.PropTypes.object,
    owners: React.PropTypes.object,
    favourites: React.PropTypes.object,
    search: React.PropTypes.object,
    ui: React.PropTypes.object,
  },

  getInitialState() {
    return {
      showAddDialog: false,
      search: {
        selectedLocalAreasIds: this.props.search.selectedLocalAreasIds || [],
        selectedEquipmentTypesIds: this.props.search.selectedEquipmentTypesIds || [],
        equipmentAttachment: this.props.search.equipmentAttachment || '',
        ownerId: this.props.search.ownerId || 0,
        ownerName: this.props.search.ownerName || 'Owner',
        lastVerifiedDate: this.props.search.lastVerifiedDate || '',
        hired: this.props.search.hired || false,
        statusCode: this.props.search.statusCode || Constant.EQUIPMENT_STATUS_CODE_APPROVED,
        equipmentId: this.props.search.equipmentId || '',
      },
      ui : {
        sortField: this.props.ui.sortField || 'seniorityText',
        sortDesc: this.props.ui.sortDesc === true,
      },
    };
  },

  buildSearchParams() {
    var searchParams = {};
    
    if (this.state.search.equipmentAttachment) {
      searchParams.equipmentAttachment = this.state.search.equipmentAttachment;
    }

    if (this.state.search.ownerId) {
      searchParams.owner = this.state.search.ownerId;
    }

    if (this.state.search.hired) {
      searchParams.hired = this.state.search.hired;
    }

    if (this.state.search.statusCode) {
      searchParams.status = this.state.search.statusCode;
    }

    if (this.state.search.selectedLocalAreasIds.length > 0) {
      searchParams.localareas = this.state.search.selectedLocalAreasIds;
    }

    if (this.state.search.selectedEquipmentTypesIds.length > 0) {
      searchParams.types = this.state.search.selectedEquipmentTypesIds;
    }

    if (this.state.search.equipmentId) {
      searchParams.equipmentId = this.state.search.equipmentId;
    }

    var notVerifiedSinceDate = Moment(this.state.search.lastVerifiedDate);
    if (notVerifiedSinceDate && notVerifiedSinceDate.isValid()) {
      searchParams.notverifiedsincedate = toZuluTime(notVerifiedSinceDate.startOf('day'));
    }

    return searchParams;
  },

  componentDidMount() {
    this.fetch();
    var equipmentTypesPromise = Api.getDistrictEquipmentTypes(this.props.currentUser.district.id);
    var ownersPromise = Api.getOwnersByDistrict(this.props.currentUser.district.id);
    var favouritesPromise = Api.getFavourites('equipment');

    Promise.all([equipmentTypesPromise, ownersPromise, favouritesPromise]).then(() => {
      // If this is the first load, then look for a default favourite
      if (!this.props.search.loaded) {
        var favourite = _.find(this.props.favourites, (favourite) => { return favourite.isDefault; });
        if (favourite) {
          this.loadFavourite(favourite);
          return;
        }
      }
    });
  },

  fetch() {
    Api.searchEquipmentList(this.buildSearchParams());
  },

  updateSearchState(state, callback) {
    this.setState({ search: { ...this.state.search, ...state }}, () => {
      store.dispatch({ type: Action.UPDATE_EQUIPMENT_LIST_SEARCH, equipmentList: this.state.search });
      if (callback) { callback(); }
    });
  },

  updateUIState(state, callback) {
    this.setState({ ui: { ...this.state.ui, ...state }}, () => {
      store.dispatch({ type: Action.UPDATE_EQUIPMENT_LIST_UI, equipmentList: this.state.ui });
      if (callback) { callback(); }
    });
  },

  loadFavourite(favourite) {
    this.updateSearchState(JSON.parse(favourite.value), this.fetch);
  },

  print() {
    window.print();
  },

  render() {
    // Constrain the local area drop downs to those in the District of the current logged in user
    var localAreas = _.chain(this.props.localAreas)
      .sortBy('name')
      .value();

    var owners = _.chain(this.props.owners.data).sortBy('organizationName').value();

    var districtEquipmentTypes = _.chain(this.props.districtEquipmentTypes.data)
      .filter(type => type.district.id == this.props.currentUser.district.id)
      .sortBy('districtEquipmentName')
      .value();

    var numResults = this.props.equipmentList.loading ? '...' : Object.keys(this.props.equipmentList.data).length;

    return <div id="equipment-list">
      <PageHeader>Equipment ({ numResults })
        <ButtonGroup id="equipment-buttons">
          <Button onClick={ this.print }><Glyphicon glyph="print" title="Print" /></Button>
        </ButtonGroup>
      </PageHeader>
      <Well id="equipment-bar" bsSize="small" className="clearfix">
        <Row>
          <Col md={10}>
            <Row>
              <ButtonToolbar id="equipment-filters-first-row">
                <MultiDropdown id="selectedLocalAreasIds" placeholder="Local Areas"
                  items={ localAreas } selectedIds={ this.state.search.selectedLocalAreasIds } updateState={ this.updateSearchState } showMaxItems={ 2 } />
                <DropdownControl id="statusCode" title={ this.state.search.statusCode } updateState={ this.updateSearchState } blankLine="(All)" placeholder="Status"
                  items={[ Constant.EQUIPMENT_STATUS_CODE_APPROVED, Constant.EQUIPMENT_STATUS_CODE_PENDING, Constant.EQUIPMENT_STATUS_CODE_ARCHIVED ]}
                />
                <MultiDropdown id="selectedEquipmentTypesIds" placeholder="Equipment Types" fieldName="districtEquipmentName"
                  items={ districtEquipmentTypes } selectedIds={ this.state.search.selectedEquipmentTypesIds } updateState={ this.updateSearchState } showMaxItems={ 2 } />
                <FilterDropdown id="ownerId" placeholder="Owner" fieldName="organizationName" blankLine="(All)"
                  items={ owners } selectedId={ this.state.search.ownerId } updateState={ this.updateSearchState } />
                <CheckboxControl inline id="hired" checked={ this.state.search.hired } updateState={ this.updateSearchState }>Hired</CheckboxControl>
              </ButtonToolbar>
            </Row>
            <Row>
              <ButtonToolbar id="equipment-filters-second-row">
                <DateControl id="lastVerifiedDate" date={ this.state.search.lastVerifiedDate } updateState={ this.updateSearchState } placeholder="mm/dd/yyyy" label="Not Verified Since:" title="Last Verified Date"/>
                <div className="input-container">
                  <ControlLabel>Attachment:</ControlLabel>
                  <FormInputControl id="equipmentAttachment" type="text" value={ this.state.search.equipmentAttachment } updateState={ this.updateSearchState } />
                </div>
                <div className="input-container">
                  <ControlLabel>Equipment Id:</ControlLabel>
                  <FormInputControl id="equipmentId" type="text" value={ this.state.search.equipmentId } updateState={ this.updateSearchState } />
                </div>
              </ButtonToolbar>
            </Row>
          </Col>
          <Col md={2}>
            <Row id="equipment-faves">
              <Favourites id="equipment-faves-dropdown" type="equipment" favourites={ this.props.favourites.data } data={ this.state.search } onSelect={ this.loadFavourite } pullRight />
            </Row>
            <Row id="equipment-search">
              <Button id="search-button" bsStyle="primary" onClick={ this.fetch }>Search</Button>
            </Row>
          </Col>
        </Row>
      </Well>

      {(() => {

        if (this.props.equipmentList.loading || this.props.owners.loading) { 
          return <div style={{ textAlign: 'center' }}><Spinner/></div>; 
        }

        if (Object.keys(this.props.equipmentList.data).length === 0 && this.props.equipmentList.success) { 
          return <Alert bsStyle="success">No equipment</Alert>; 
        }
        
        return (
          <EquipmentTable
            ui={this.state.ui}
            updateUIState={this.updateUIState}
            equipmentList={this.props.equipmentList.data}
          />
        );

      })()}

    </div>;
  },
});


function mapStateToProps(state) {
  return {
    currentUser: state.user,
    equipmentList: state.models.equipmentList,
    localAreas: state.lookups.localAreas,
    districtEquipmentTypes: state.lookups.districtEquipmentTypes,
    owners: state.lookups.owners,
    favourites: state.models.favourites,
    search: state.search.equipmentList,
    ui: state.ui.equipmentList,
  };
}

export default connect(mapStateToProps)(Equipment);
