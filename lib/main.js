import Pajax from './pajax.js';
import PajaxJSON from './json.js';
import PajaxURLEncoded from './urlencoded.js';
import qs from './qs.js';
import {isURL,parseURL} from './url-parser.js';
import {merge} from './utils.js';
import {checkStatus} from './pipelets.js';
import Configurator from './configurator.js';

// configurator
Pajax.Configurator = Configurator;

// custom classes
Pajax.URLEncoded = PajaxURLEncoded;
Pajax.JSON = PajaxJSON;

// helpers
Pajax.qsParse = qs.parse;
Pajax.qsStringify = qs.stringify;
Pajax.parseURL = parseURL;
Pajax.isURL = isURL;
Pajax.merge = merge;

// pipelets
Pajax.checkStatus = checkStatus;

export default Pajax;
