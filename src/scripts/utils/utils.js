
// TODO might want step size in here
function rangeIter(start, end) {
    let dist = end - start;
    let size = Math.abs(dist);
    return Array(size).keys();
}

function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default {
  rangeIter: rangeIter,

  distanceBetweenPoints: function(pt1, pt2) {
    let dx = pt2.x - pt1.x;
    let dy = pt2.y - pt1.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  range: function(start, end) {
    return [...rangeIter(start, end)];
  },

  guid: guid
};
