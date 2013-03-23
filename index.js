var pull = require('pull-stream')

module.exports = pull.pipeable(function (read, writer, ender) {
  var queue = [], ended
  
  function enqueue (data) {
    queue.push(data)
  }

  writer = writer || function (data) {
    this.queue(data)
  }

  ender = ender || function () {
    this.queue(null)
  }

  var emitter = {
    emit: function (event, data) {
      if(event == 'data') enqueue(data)
      if(event == 'end')  enqueue(null)
    },
    queue: enqueue
  }

  return function (end, cb) {
    ended = ended || end
    ;(function pull () {
      if(queue.length) {
        var data = queue.shift()
        cb(data === null, data)
      } else {
        read(ended, function (end, data) {
          if(data) writer.call(emitter, data)
          if(ended = end)  ender.call(emitter)
          process.nextTick(pull)
        })
      }
    })()
  }
})

