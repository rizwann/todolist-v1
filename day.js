exports.day = function () {
  var dateObj = new Date();
  var weekday = dateObj.toLocaleString("default", { weekday: "long" });
  return weekday;
}
