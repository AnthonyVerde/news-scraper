$(document).ready(function () {
  $.getJSON("/articles", function (data) {
    for (var i = 0; i < data.length; i++) {

      var articleURL = data[i].link;
      var articleSummary = data[i].summary;

      $("#articles").append("<h2 data-id='" + data[i]._id + "'>"
        + data[i].title
        + "</h2>" + "<br>"
        + "<h5 class='summary'>" + articleSummary + "</h5>"
        + `<a class="readmore" target="blank" href=${articleURL}><p>Read more</p></a>`
        + "<hr>"
      );
    }
  });

  $(document).on("click", "h2", function () {
    $("#comments").empty();
    var thisId = $(this).attr("data-id");

    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })

      .then(function (data) {
        console.log(data);
        $("#comments").append("<p>" + data.title + "</p>");
        $("#comments").append("<input id='titleinput' name='title' >" + "<br>");
        $("#comments").append("<textarea id='bodyinput' name='body'></textarea>" + "<br>");
        $("#comments").append("<button data-id='" + data._id + "' id='savecomment'>Save Comment</button>");

        if (data.note) {
          $("#titleinput").val(data.note.title);
          $("#bodyinput").val(data.note.body);
        }
      });
  });

  $(document).on("click", "#savecomment", function () {
    var thisId = $(this).attr("data-id");
    alert("Comment saved")

    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        title: $("#titleinput").val(),
        body: $("#bodyinput").val()
      }
    })
      .then(function (data) {
        $("#comments").empty();
      });

    $("#titleinput").val("");
    $("#bodyinput").val("");
  });
});
