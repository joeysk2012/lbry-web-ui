var ChannelPage = React.createClass({
  propTypes: {
    name: React.PropTypes.string,
  },
  getInitialState: function() {
    return {
      metadata: null,
      streamClaimInfos: null,
    };
  },
  componentWillMount: function() {
    document.title = 'Channel';

    lbry.lighthouse.getClaimInfo(this.props.name, (claimInfo) => {
      const {type, title} = claimInfo.value;
      if (type != 'channel') {
        throw Error('Claim is not a channel');
      }

      document.title = title;

      this.setState({
        metadata: claimInfo.value,
        streamClaimInfos: [],
      });

      lbry.lighthouse.getStreamsForChannel(this.props.name, (streamNames) => {
        for (let streamName of streamNames) {
          lbry.lighthouse.getClaimInfo(streamName, (streamClaimInfo) => {
            this.setState({
              streamClaimInfos: this.state.streamClaimInfos.concat([streamClaimInfo])
            });
          });
        }
      });
    });
  },
  render: function() {
    if (!this.state.metadata) {
      return null;
    }

    const {title, thumbnail, description} = this.state.metadata;

    let streams = [];
    for (let {name, cost, available, value: {title, thumbnail, description, nsfw, content_type}} of this.state.streamClaimInfos) {
      streams.push(<SearchResultRow name={name} title={title} imgUrl={thumbnail || '/img/default-thumb.svg'}
               description={description} mediaType={lbry.getMediaType(content_type)}
               cost={cost} nsfw={nsfw} available={available} />);
    }

    return (
      <main className='channel-page'>
        <div className="channel-page__info">
          <div>
            <img src={thumbnail || '/img/default-thumb.svg'} className="channel-page__thumbnail" />
          </div>
          <div className="channel-page__description">
            <h3>{title}</h3>
            {description}
          </div>
        </div>
        {streams}
      </main>
    );
  }
});