
// TODO might want step size in here
function rangeIter(start, end) {
    let dist = end - start;
    let size = Math.abs(dist);
    return Array(size).keys();
}

export default {
  rangeIter: rangeIter,
  range: function(start, end) {
    return [...rangeIter(start, end)];
  }
};
