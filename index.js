var pull = require('pull-stream')

var next = 
  'undefined' !== typeof setImmediate 
    ? setImmediate
    : process.nextTick

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
      console.error(event, data)
      if(event == 'data') enqueue(data)
      if(event == 'end')  enqueue(null)
      if(event == 'error') error = data
    },
    queue: enqueue
  }

  return function (end, cb) {
    ended = ended || end
    ;(function pull () {
      //if it's an error
      if(error) cb(error)
      else if(queue.length) {
        var data = queue.shift()
        cb(data === null, data)
      }
      else {
        read(ended, function (end, data) {
           //null has no special meaning for pull-stream
          if(data) writer.call(emitter, data || undefined)
          if(ended = ended || end)  ender.call(emitter)
          next(pull)
        })
      }
    })()
  }
})

