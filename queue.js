function Queue(c) {
  this.max = c;
  this.cur = 0;
  this.elements = [];
}

module.exports = {
  queue: function(capacity) {
    return new Queue(capacity);
  },

  append: function(q, e) {
    q.elements.push(e);

    if (q.elements.length > q.max) {
      this.pop(q);
    }
  },

  pop: function(q) {
    return q.elements.shift();
  },

  next: function(q) {
    if (q.cur < q.elements.length) {
      ret = q.elements[q.cur];
    }
    q.cur = (q.cur + 1) % q.max;
    return ret;
  },

  isEmpty: function(q) {
    return q.elements.length === 0;
  },

  contains: function(q, e) {
    for (let i = 0; i < q.elements.length; i++) {
      if (q.elements[i] === e) {
        return true;
      }
    }
    return false;
  },

  elements: function(q) {
    return q.elements;
  },

  length: function(q) {
    return q.elements.length;
  },

};
