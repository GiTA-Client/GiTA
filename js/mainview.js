$('.frame').mousedown(function () {
    $(".active").removeClass("active");
    $(this).addClass("active");
});
$('.frame').not(".maximized").resizable({
    alsoResize: ".active .content",
    minWidth: 50,
    minHeight: 59
}).draggable({
    handle: ".topbar"
});

$('.swatches span').click(function () {
    let color = $(this).attr("class");
    $(this).parent().parent().attr("class", "topbar").addClass(color);
});

$('.maxbtn').click(function () {
    $(this).parent().parent().toggleClass("maximized");
});

$('.xbtn').click(function () {
    $(this).parent().parent().remove();
});
