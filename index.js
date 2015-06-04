var pull = require('pull-stream')
var looper = require('looper')

module.exports = pull.pipeable(function (read, writer, ender) {
  var queue = [], ended, error

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
      if(event == 'error') error = data
    },
    queue: enqueue
  }

  return function (end, cb) {
    ended = ended || end
    looper(function pull (next) {
      //if it's an error
      if(error) cb(error)
      else if(queue.length) {
        var data = queue.shift()
        cb(data === null, data)
      }
      else {
        read(ended, function (end, data) {
           //null has no special meaning for pull-stream
          if(end && end !== true) {
            error = end; return next()
          }
          if(ended = ended || end)  ender.call(emitter)
          else if(data !== null) writer.call(emitter, data)
          next(pull)
        })
      }
    })
  }
})

