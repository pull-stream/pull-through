var pull = require('pull-stream')

module.exports = pull.pipeable(function (read, writer, ender) {
  var queue = [], waiting = []
  
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

/*
function split (matcher, mapper) {
  var soFar = ''
  if('function' === typeof matcher)
    mapper = matcher, matcher = null
  if (!matcher)
    matcher = '\n'

  return through(function (buffer) { 
    var stream = this
      , pieces = (soFar + buffer).split(matcher)
    soFar = pieces.pop()

    for (var i = 0; i < pieces.length; i++) {
      var piece = pieces[i]
      if(mapper) {
        piece = mapper(piece)
        if('undefined' !== typeof piece)
          stream.queue(piece)
      }
      else
        stream.queue(piece)
    }
  },
  function () {
    if(soFar)
      this.queue(soFar)  
    this.queue(null)
  })

}


if(!module.parent) {
  var fs = require('fs')
  var file = fs.readFileSync(__filename).toString()
  var lines = file.split('/n')
  var i = 0, block = 300

var sp = 
  pull.pipeableSource(function () {
    return function (end, cb) {
      if (i > file.length)
        cb(true)
      else {
        var _i = i
        i += block
        cb(null, file.substring(_i, _i + block))
      }
    }
  })()
  .pipe(split())
  .pipe(pull.writeArray(function (err, array){
    console.log(array)
  }))
}
*/
//LAST LINE
