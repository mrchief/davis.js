module("Request Module");

test("request without any params", function () {
  var request = factory('request')

  equal('get', request.method, "should store the request method");
  equal('/foo', request.path, "should store the request path");
  equal('foo', request.title, "should store the title for the request");
  ok(!request.queryString, "should have no query string");
  same({}, request.params, "should have no params");
});

test("request with params", function () {
  var request = factory('request', {
    method: 'post',
    fullPath: '/foo?bar=baz'
  })

  equal('post', request.method, "should store the request method");
  equal('/foo', request.path, "should store the path without any of the query params");
  equal('foo', request.title, "should store the title for the request");
  equal('bar=baz', request.queryString, "should store the query string");
  same({bar: "baz"}, request.params, "should add any params to the request params object");
});

test("convert request to readable string", function () {
  var request = factory('request', {
    method: 'post',
    fullPath: '/foo?bar=baz'
  })

  equal('POST /foo', request.toString(), "should include the method and the fullPath")
})

test("using _method param will set the method of the request", function () {
  var request = factory('request', {
    fullPath: '/foo?_method=put&name=bob',
  });

  equal('put', request.method, "should use the _method param to set the requests method")
})

test("parsing rails style nested params", function () {
  var request = factory('request', {
    fullPath: '/foo?note[name]=123&note[title]=asdf'
  })

  same({note: {
    name: '123',
    title: 'asdf'
  }}, request.params, "should combine the nested params into a separate object under params")
})

test("generating a request for the initial page load", function () {
  var request = Davis.Request.forPageLoad()

  equal('get', request.method, "should have a method of get")
  equal(window.location.pathname, request.path, "should have the current location path as the path")
  equal(document.title, request.title, "should take the current page title as the title")
})

test("adding a whenStale callback", function () {
  var request = factory('request')

  var staleCallback = function () {};
  request.whenStale(staleCallback)
  same(staleCallback, request._staleCallback)
})

test("marking a request as stale", function () {
  var request = factory('request')
  var callbackCalled = false;

  request.whenStale(function () {
    callbackCalled = true
  })
  request.makeStale();

  ok(callbackCalled, "marking a request as stale should call the whenStale callback")
})

test("passing the next request in to the whenStale callback", function () {
  var request = factory('request')
  var callbackReq

  request.whenStale(function (nextReq) {
    callbackReq = nextReq
    start()
  })

  stop()
  var nextRequest = factory('request')

  same(callbackReq, nextRequest, "the next request should be passed as a parameter to the when stale callback")
})

test("request has a location that the page url is changed too", function () {
  var reloadableRequest = factory('request')
  var nonReloadableRequest = factory('request', {
    method: 'state'
  })

  equal(reloadableRequest.path, reloadableRequest.location(), "reloadable (GET, POST, PUT, DELETE) request location should match the path")
  equal('', nonReloadableRequest.location(), "non reloadable requests should have a blank location")
})

test("pass a request to the server", function () {
  var serverCalled = false

  var request = factory('request', {
    delegateToServer: function () {
      serverCalled = true
    }
  })

  request.delegateToServer()

  ok(serverCalled, "should have delegated responsibility for the route to the server")
})