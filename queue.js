function Queue(c) {
  this.max = c;
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
};
