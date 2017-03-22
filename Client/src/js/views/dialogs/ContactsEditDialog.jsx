import React from 'react';

import { connect } from 'react-redux';

import { Grid, Row, Col, Button, Label } from 'react-bootstrap';
import { Form, FormGroup, HelpBlock, ControlLabel } from 'react-bootstrap';

import * as Constant from '../../constants';

import EditDialog from '../../components/EditDialog.jsx';
import FormInputControl from '../../components/FormInputControl.jsx';

import { isBlank } from '../../utils/string';

var ContactsEditDialog = React.createClass({
  propTypes: {
    contact: React.PropTypes.object.isRequired,

    onSave: React.PropTypes.func.isRequired,
    onClose: React.PropTypes.func.isRequired,
    show: React.PropTypes.bool,
  },

  getInitialState() {
    return {
      isNew: this.props.contact.id === 0,

      givenName: this.props.contact.givenName || '',
      surname: this.props.contact.surname || '',
      organizationName: this.props.contact.organizationName || '',
      role: this.props.contact.role || '',
      notes: this.props.contact.notes || '',
      emailAddress: this.props.contact.emailAddress || '',
      workPhoneNumber: this.props.contact.workPhoneNumber || '',
      mobilePhoneNumber: this.props.contact.mobilePhoneNumber || '',
      faxPhoneNumber: this.props.contact.faxPhoneNumber || '',
      address1: this.props.contact.address1 || '',
      address2: this.props.contact.address2 || '',
      city: this.props.contact.city || '',
      province: this.props.contact.province || '',
      postalCode: this.props.contact.postalCode || '',
      isPrimary: this.props.contact.isPrimary || false,

      givenNameError: false,
      surnameError: false,
      emailAddressError: false,
      workPhoneNumberError: false,
      mobilePhoneNumberError: false,
      faxPhoneNumberError: false,
    };
  },

  componentDidMount() {
    this.input.focus();
  },

  updateState(state, callback) {
    this.setState(state, callback);
  },

  makePrimary() {
    this.setState({ isPrimary: true });
  },

  didChange() {
    if (this.state.givenName !== this.props.contact.givenName) { return true; }
    if (this.state.surname !== this.props.contact.surname) { return true; }
    if (this.state.organizationName !== this.props.contact.organizationName) { return true; }
    if (this.state.role !== this.props.contact.role) { return true; }
    if (this.state.notes !== this.props.contact.notes) { return true; }
    if (this.state.emailAddress !== this.props.contact.emailAddress) { return true; }
    if (this.state.workPhoneNumber !== this.props.contact.workPhoneNumber) { return true; }
    if (this.state.mobilePhoneNumber !== this.props.contact.mobilePhoneNumber) { return true; }
    if (this.state.faxPhoneNumber !== this.props.contact.faxPhoneNumber) { return true; }
    if (this.state.address1 !== this.props.contact.address1) { return true; }
    if (this.state.address2 !== this.props.contact.address2) { return true; }
    if (this.state.city !== this.props.contact.city) { return true; }
    if (this.state.province !== this.props.contact.province) { return true; }
    if (this.state.postalCode !== this.props.contact.postalCode) { return true; }
    if (this.state.isPrimary !== this.props.contact.isPrimary) { return true; }

    return false;
  },

  isValid() {
    this.setState({
      givenNameError: false,
      surnameError: false,
      emailAddressError: false,
      workPhoneNumberError: false,
      mobilePhoneNumberError: false,
      faxPhoneNumberError: false,
    });

    var valid = true;

    if (isBlank(this.state.givenName)) {
      this.setState({ givenNameError: 'Given Name is required' });
      valid = false;
    }

    if (isBlank(this.state.surname)) {
      this.setState({ surnameError: 'Surname is required' });
      valid = false;
    }

    if (isBlank(this.state.emailAddress)) {
      this.setState({ emailAddressError: 'Email is required' });
      valid = false;
    } else if (!Constant.EMAIL_REGEX.test(this.state.emailAddress)) {
      // Just a simple RegEx test for X@Y.Z
      this.setState({ emailAddressError: 'Invalid Email format' });
      valid = false;
    }

    // TODO: Check validity of email address and phone number formats

    if (isBlank(this.state.workPhoneNumber) && isBlank(this.state.mobilePhoneNumber)) {
      this.setState({
        workPhoneNumberError: 'A work or cell phone number is required',
        mobilePhoneNumberError: ' ',
      });
      valid = false;
    } else if (!isBlank(this.state.workPhoneNumber) && !Constant.NANP_REGEX.test(this.state.workPhoneNumber)) {
      this.setState({ workPhoneNumberError: 'Invalid phone number format' });
      valid = false;
    } else if (!isBlank(this.state.mobilePhoneNumber) && !Constant.NANP_REGEX.test(this.state.mobilePhoneNumber)) {
      this.setState({ mobilePhoneNumberError: 'Invalid phone number format' });
      valid = false;
    } else if (!isBlank(this.state.faxPhoneNumber) && !Constant.NANP_REGEX.test(this.state.faxPhoneNumber)) {
      this.setState({ faxPhoneNumberError: 'Invalid phone number format' });
      valid = false;
    }

    return valid;
  },

  onSave() {
    this.props.onSave({ ...this.props.contact, ...{
      givenName: this.state.givenName,
      surname: this.state.surname,
      organizationName: this.state.organizationName,
      role: this.state.role,
      notes: this.state.notes,
      emailAddress: this.state.emailAddress,
      workPhoneNumber: this.state.workPhoneNumber,
      mobilePhoneNumber: this.state.mobilePhoneNumber,
      faxPhoneNumber: this.state.faxPhoneNumber,
      address1: this.state.address1,
      address2: this.state.address2,
      city: this.state.city,
      province: this.state.province,
      postalCode: this.state.postalCode,
      isPrimary: this.state.isPrimary,
    }});
  },

  render() {
    // Read-only if the user cannot edit the contact
    var isReadOnly = !this.props.contact.canEdit && this.props.contact.id !== 0;

    return <EditDialog id="contacts-edit" show={ this.props.show } bsSize="large"
      onClose={ this.props.onClose } onSave={ this.onSave } didChange={ this.didChange } isValid={ this.isValid }
      title={ <span>
        <strong>Contact</strong>
        { this.state.isPrimary ?
          <Label bsStyle="success">Primary</Label> :
          <Button title="Make Primary Contact" onClick={ this.makePrimary }>Make Primary</Button>
        }
      </span> }>
      {(() => {
        return <Form>
          <Grid fluid>
            <Row>
              <Col md={3}>
                <FormGroup controlId="givenName" validationState={ this.state.givenNameError ? 'error' : null }>
                  <ControlLabel>Given Name <sup>*</sup></ControlLabel>
                  <FormInputControl type="text" defaultValue={ this.state.givenName } readOnly={ isReadOnly } updateState={ this.updateState } inputRef={ ref => { this.input = ref; }}/>
                  <HelpBlock>{ this.state.givenNameError }</HelpBlock>
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup controlId="surname" validationState={ this.state.surnameError ? 'error' : null }>
                  <ControlLabel>Surname <sup>*</sup></ControlLabel>
                  <FormInputControl type="text" defaultValue={ this.state.surname } readOnly={ isReadOnly } updateState={ this.updateState }/>
                  <HelpBlock>{ this.state.surnameError }</HelpBlock>
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup controlId="organizationName">
                  <ControlLabel>Organization</ControlLabel>
                  <FormInputControl type="text" defaultValue={ this.state.organizationName } readOnly={ isReadOnly } updateState={ this.updateState }/>
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup controlId="role">
                  <ControlLabel>Role</ControlLabel>
                  <FormInputControl type="text" defaultValue={ this.state.role } readOnly={ isReadOnly } updateState={ this.updateState }/>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={3}>
                <FormGroup controlId="address1">
                  <ControlLabel>Address 1</ControlLabel>
                  <FormInputControl type="text" defaultValue={ this.state.address1 } readOnly={ isReadOnly } updateState={ this.updateState }/>
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup controlId="address2">
                  <ControlLabel>Address 2</ControlLabel>
                  <FormInputControl type="text" defaultValue={ this.state.address2 } readOnly={ isReadOnly } updateState={ this.updateState }/>
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup controlId="city">
                  <ControlLabel>City</ControlLabel>
                  <FormInputControl type="text" defaultValue={ this.state.city } readOnly={ isReadOnly } updateState={ this.updateState }/>
                </FormGroup>
              </Col>
              <Col md={1}>
                <FormGroup controlId="province">
                  <ControlLabel>Province</ControlLabel>
                  <FormInputControl type="text" defaultValue={ this.state.province } readOnly={ isReadOnly } updateState={ this.updateState }/>
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup controlId="postalCode">
                  <ControlLabel>Postal Code</ControlLabel>
                  <FormInputControl type="text" defaultValue={ this.state.postalCode } readOnly={ isReadOnly } updateState={ this.updateState }/>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={3}>
                <FormGroup controlId="workPhoneNumber" validationState={ this.state.workPhoneNumberError ? 'error' : null }>
                  <ControlLabel>Work Phone <sup>*</sup></ControlLabel>
                  <FormInputControl type="text" defaultValue={ this.state.workPhoneNumber } readOnly={ isReadOnly } updateState={ this.updateState }/>
                  <HelpBlock>{ this.state.workPhoneNumberError }</HelpBlock>
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup controlId="mobilePhoneNumber" validationState={ this.state.mobilePhoneNumberError ? 'error' : null }>
                  <ControlLabel>Cell Phone <sup>*</sup></ControlLabel>
                  <FormInputControl type="text" defaultValue={ this.state.mobilePhoneNumber } readOnly={ isReadOnly } updateState={ this.updateState }/>
                  <HelpBlock>{ this.state.mobilePhoneNumberError }</HelpBlock>
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup controlId="faxPhoneNumber" validationState={ this.state.faxPhoneNumberError ? 'error' : null }>
                  <ControlLabel>Fax</ControlLabel>
                  <FormInputControl type="text" defaultValue={ this.state.faxPhoneNumber } readOnly={ isReadOnly } updateState={ this.updateState }/>
                  <HelpBlock>{ this.state.faxPhoneNumberError }</HelpBlock>
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup controlId="emailAddress" validationState={ this.state.emailAddressError ? 'error' : null }>
                  <ControlLabel>Email <sup>*</sup></ControlLabel>
                  <FormInputControl type="text" defaultValue={ this.state.emailAddress } readOnly={ isReadOnly } updateState={ this.updateState }/>
                  <HelpBlock>{ this.state.emailAddressError }</HelpBlock>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <FormGroup controlId="notes">
                  <ControlLabel>Notes</ControlLabel>
                  <FormInputControl componentClass="textarea" defaultValue={ this.state.notes } updateState={ this.updateState } />
                </FormGroup>
              </Col>
            </Row>
          </Grid>
        </Form>;
      })()}
    </EditDialog>;
  },
});

function mapStateToProps(state) {
  return {
    contactz: state.models.contact,
  };
}

export default connect(mapStateToProps)(ContactsEditDialog);
