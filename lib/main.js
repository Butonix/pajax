import Pajax from './pajax';
import PajaxJSON from './json';
import PajaxURLEncoded from './urlencoded';
import qs from './qs';
import {isURL,parseURL} from './url-parser';
import {merge} from './utils';
import {checkStatus} from './pipelets';
import Configurator from './configurator';

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
