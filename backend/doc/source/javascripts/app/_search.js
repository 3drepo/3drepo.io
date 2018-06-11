//= require ../lib/_lunr
//= require ../lib/_jquery
//= require ../lib/_jquery.highlight
(function () {
  "use strict";

  let content, searchResults;
  let highlightOpts = { element: "span", className: "search-highlight" };

  let index = new lunr.Index();

  index.ref("id");
  index.field("title", { boost: 10 });
  index.field("body");
  index.pipeline.add(lunr.trimmer, lunr.stopWordFilter);

  $(populate);
  $(bind);

  function populate() {
    $("h1, h2").each(function() {
      let title = $(this);
      let body = title.nextUntil("h1, h2");
      index.add({
        id: title.prop("id"),
        title: title.text(),
        body: body.text()
      });
    });
  }

  function bind() {
    content = $(".content");
    searchResults = $(".search-results");

    $("#input-search").on("keyup", search);
  }

  function search(event) {
    unhighlight();
    searchResults.addClass("visible");

    // ESC clears the field
    if (event.keyCode === 27) {this.value = "";}

    if (this.value) {
      let results = index.search(this.value).filter(function(r) {
        return r.score > 0.0001;
      });

      if (results.length) {
        searchResults.empty();
        $.each(results, function (index, result) {
          let elem = document.getElementById(result.ref);
          searchResults.append("<li><a href='#" + result.ref + "'>" + $(elem).text() + "</a></li>");
        });
        highlight.call(this);
      } else {
        searchResults.html("<li></li>");
        $(".search-results li").text("No Results Found for \"" + this.value + "\"");
      }
    } else {
      unhighlight();
      searchResults.removeClass("visible");
    }
  }

  function highlight() {
    if (this.value) {content.highlight(this.value, highlightOpts);}
  }

  function unhighlight() {
    content.unhighlight(highlightOpts);
  }
})();
