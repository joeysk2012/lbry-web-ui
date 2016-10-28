lbry.lighthouse = {
  servers: [
    'http://lighthouse1.lbry.io:50005',
    'http://lighthouse2.lbry.io:50005',
    'http://lighthouse3.lbry.io:50005',
  ],
  path: '/',

  call: function(method, params, callback, errorCallback, connectFailedCallback) {
    lbry.jsonrpc_call(this.server + this.path, method, params, callback, errorCallback, connectFailedCallback);
  },
};

lbry.lighthouse.server = lbry.lighthouse.servers[Math.round(Math.random() * (lbry.lighthouse.servers.length - 1))];


lbry.lighthouse.search = function(query, callback, includeChannels=false)
{
  lbry.lighthouse.call('search', [query], function(results) {
    if (!includeChannels) {
      callback(results);
    } else {
      let channelMetadatasProcessed = 0;
      for (let result of results) {
        /**** Dummy code, simulate some streams having channels ****/
        if (result.name == 'itsadisaster' || result.name == 'bellflower') {
          result.value.channel = 'oscilloscope/9777bf01b16f144d7b51e5618ca41bf6a73f62af38348c3ad826f8276d1199ff';
        } else if (result.name == 'what' || result.name.startsWith('superman')) {
          result.value.channel = 'lbry/4d7f69701b16f142af38348c3a6f8276d1199ffsdb51e56177bf8ca41bf6a7382';
        }
        /**** End of dummy code ****/

        if (!result.value.channel) {
          channelMetadatasProcessed++;
          if (channelMetadatasProcessed >= results.length) {
            callback(results);
          }
        } else {
          lbry.lighthouse.getClaimInfo(result.value.channel, function(channelClaimInfo) {
            result.channel_metadata = channelClaimInfo.value;
            channelMetadatasProcessed++;
            if (channelMetadatasProcessed >= results.length) {
              callback(results);
            }
          });
        }
      }
    }
  });
};

lbry.lighthouse.getClaimInfo = function(uri, callback, includeChannel=false) {
  /**** Dummy code until channel claims are implemented ****/
  if (uri == 'oscilloscope/9777bf01b16f144d7b51e5618ca41bf6a73f62af38348c3ad826f8276d1199ff') {
    callback({
      'name': 'oscilloscope',
      'amount': 1,
      'value': {
        'ver': '0.0.1',
        'type': 'channel',
        'title': 'Oscilloscope Laboratories',
        'description': 'OSCILLOSCOPE LABORATORIES has three divisions. It is like a three-headed dragon. The brains of the three heads are designed to think uniquely. While O-SCOPE PICTURES is thinking about distributing films, O-SCOPE PRODUCTIONS is thinking about making films, and the third head is mostly thinking about making music.',
        'thumbnail': 'http://i.imgur.com/UHN3plu.jpg',
      },
    });
    return;
  } else if (uri == 'lbry/4d7f69701b16f142af38348c3a6f8276d1199ffsdb51e56177bf8ca41bf6a7382') {
    callback({
      'name': 'lbry',
      'amount': 1,
      'value': {
        'ver': '0.0.1',
        'type': 'channel',
        'title': 'LBRY',
        'description': 'Official content from the LBRY team.',
        'thumbnail': 'https://s3.amazonaws.com/files.lbry.io/logo.png',
      },
    });
    return;
  }
  /**** End dummy code ****/

  // There will eventually be a special Lighthouse method for this
  return lbry.lighthouse.search(lbry.parseUri(uri).name, function(results) {
    callback(results[0]);
  }, includeChannel);
};
