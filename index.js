var pull = require('pull-stream')

module.exports = pull.pipeable(function (read, writer, ender) {
  var queue = []
  
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
    ;(function pull () {
      if(queue.length) {
        var data = queue.shift()
        cb(data === null, data)
      } else read(null, function (end, data) {
        if(data) writer.call(emitter, data)
        if(end)  ender.call(emitter)
        process.nextTick(pull)
      })
    })()
  }
})

