import { combineReducers } from 'redux';

import uiReducer from './ui';
import userReducer from './user';
import modelsReducer from './models';
import lookupsReducer from './lookups';


export default combineReducers({
  ui      : uiReducer,
  user    : userReducer,  
  models  : modelsReducer,
  lookups : lookupsReducer,
});