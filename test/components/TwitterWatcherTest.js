var TwitterWatcher = require('../../lib/components/TwitterWatcher'),
  EventEmitter = require('events').EventEmitter,
  sinon = require('sinon'),
  expect = require('chai').expect

describe('TwitterWatcher', function() {
  var twitterWatcher

  beforeEach(function() {
    twitterWatcher = new TwitterWatcher()
    twitterWatcher._logger = {
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub(),
      debug: sinon.stub()
    }
    twitterWatcher._twitter = {
      stream: sinon.stub()
    }
    twitterWatcher._matchers = []
  })

  it('should respond to a tweet', function(done) {
    var stream = new EventEmitter();
    var tweet = {
      text: 'foo',
      user: 'bar'
    }

    twitterWatcher._matchers.push({
      process: function(passedTweet, next) {
        expect(passedTweet).to.deep.equal(tweet)
        expect(next).to.be.ok

        done()
      }
    })

    twitterWatcher.afterPropertiesSet()

    var stream = new EventEmitter()

    var cb = twitterWatcher._twitter.stream.withArgs('user', sinon.match.func).getCall(0).args[1]
    cb(stream)

    stream.emit('data', tweet)
  })

  it('should try multiple tweet matchers', function(done) {
    var tweet = {
      text: 'foo',
      user: 'bar'
    }

    twitterWatcher._matchers.push({
      process: function(passedTweet, next) {
        next()
      }
    })
    twitterWatcher._matchers.push({
      process: function(passedTweet, next) {
        expect(passedTweet).to.deep.equal(tweet)
        expect(next).to.be.ok

        done()
      }
    })

    twitterWatcher.afterPropertiesSet();

    var stream = new EventEmitter()

    var cb = twitterWatcher._twitter.stream.withArgs('user', sinon.match.func).getCall(0).args[1]
    cb(stream)

    stream.emit('data', tweet)
  })

  it('should not match invalid tweet', function() {
    var tweet = {}

    twitterWatcher._matchers.push({
      process: function() {
        throw new Error('Should not have processed invalid tweet')
      }
    })

    twitterWatcher.afterPropertiesSet();

    var stream = new EventEmitter()

    var cb = twitterWatcher._twitter.stream.withArgs('user', sinon.match.func).getCall(0).args[1]
    cb(stream)

    stream.emit('data', tweet)
  })

  it('should try all multiple tweet', function() {
    var tweet = {
      text: 'foo',
      user: 'bar'
    }

    var invoked = 0;

    twitterWatcher._matchers.push({
      process: function(passedTweet, next) {
        invoked++

        next()
      }
    })
    twitterWatcher._matchers.push({
      process: function(passedTweet, next) {
        invoked++

        next()
      }
    })
    twitterWatcher._matchers.push({
      process: function(passedTweet, next) {
        invoked++

        next()
      }
    })

    twitterWatcher.afterPropertiesSet();

    var stream = new EventEmitter()

    var cb = twitterWatcher._twitter.stream.withArgs('user', sinon.match.func).getCall(0).args[1]
    cb(stream)

    stream.emit('data', tweet)

    expect(invoked).to.equal(3)
  })
})
