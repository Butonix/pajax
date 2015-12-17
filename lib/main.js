import Pajax from './pajax';
import Request from './request';
import Response from './response';
import PajaxJSON from './json';
import PajaxURLEncoded from './urlencoded';
import qs from './qs';
import {isURL,parseURL} from './url-parser';
import {clone,merge} from './utils';
import {checkStatus} from './pipelets';

Pajax.URLEncoded = PajaxURLEncoded;
Pajax.JSON = PajaxJSON;
Pajax.Request = Request;
Pajax.Response = Response;
Pajax.qsParse = qs.parse;
Pajax.qsStringify = qs.stringify;
Pajax.parseURL = parseURL;
Pajax.isURL = isURL;
Pajax.clone = clone;
Pajax.merge = merge;
Pajax.checkStatus = checkStatus;

export default Pajax;
