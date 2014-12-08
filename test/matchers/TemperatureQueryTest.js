var sinon = require('sinon'),
  expect = require('chai').expect,
  TemperatureQuery = require('../../lib/matchers/TemperatureQuery')

describe('TemperatureQuery', function() {
  var matcher

  beforeEach(function() {
    matcher = new TemperatureQuery()
    matcher._logger = {
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub(),
      debug: sinon.stub()
    }
    matcher._twitter = {
      updateStatus: sinon.stub()
    }
  })

  it('should match temperature query', function() {
    var tweet = {
      id_str: 'id_str',
      text: '@evelinabrewshed temp ipa-2',
      user: {
        screen_name: 'sender'
      }
    }

    matcher.process(tweet)

    expect(matcher._twitter.updateStatus.withArgs(sinon.match.string, sinon.match.object, sinon.match.func).callCount).to.equal(1)
  })
})
