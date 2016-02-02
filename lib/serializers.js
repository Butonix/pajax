import qs from './qs';

export let serializers = {
   'application/json': JSON.stringify,
   'application/ld+json': JSON.stringify,
   'application/x-www-form-urlencoded': qs.stringify
};

export let deserializers = {
  'application/json': JSON.parse,
  'application/ld+json': JSON.parse,
  'application/x-www-form-urlencoded': qs.parse
};
