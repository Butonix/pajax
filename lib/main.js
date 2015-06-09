import Pajax from './pajax';
import PajaxRequest from './request';
import PajaxJSON from './json';
import PajaxURLEncoded from './urlencoded';
import qs from './qs';
import {isIRI, parseIRI} from './iri';
import * as _ from './utils';

Pajax.Request = PajaxRequest;
Pajax.JSON = PajaxJSON;
Pajax.URLEncoded = PajaxURLEncoded;
Pajax.qsParse = qs.parse;
Pajax.qsStringify = qs.stringify;
Pajax.parseIRI = parseIRI;
Pajax.isIRI = isIRI;
Pajax.clone = _.clone;
Pajax.merge = _.merge;
Pajax.defaults = _.defaults;

export default Pajax;
