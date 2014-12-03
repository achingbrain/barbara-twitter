var DefaultMatcher = require('../../lib/matchers/DefaultMatcher'),
  sinon = require('sinon'),
  expect = require('chai').expect

describe('DefaultMatcher', function() {
  var matcher

  beforeEach(function() {
    matcher = new DefaultMatcher()
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

  it('should reply with default message', function() {
    var tweet = {
      id_str: 'id_str',
      text: 'foo',
      user: {
        screen_name: 'sender'
      }
    }

    matcher.process(tweet)

    expect(matcher._twitter.updateStatus.withArgs(sinon.match.string, sinon.match.object, sinon.match.func).callCount).to.equal(1)
  })
})
