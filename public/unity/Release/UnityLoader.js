Object.defineProperty(Module, "asmLibraryArg", {
    set: function (value) {
      value._JS_WebRequest_Create = function (url, method) {
        var http = new XMLHttpRequest;
        var _url = Pointer_stringify(url);
        var _method = Pointer_stringify(method);
        http.open(_method, _url, true);
        http.withCredentials = true; // can be also set conditionally depending on the _url variable
        http.responseType = "arraybuffer";
        wr.requestInstances[wr.nextRequestId] = http;
        return wr.nextRequestId++;
      }
      Module._asmLibraryArg = value;
    },
    get: function () { return Module._asmLibraryArg; },
  });

