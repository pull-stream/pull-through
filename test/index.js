var tape = require('tape')
var pull = require('pull-stream')
var through = require('../')

tape('emit error', function (t) {
  var err = new Error('expected error')
  pull(
    pull.values([1,2,3]),
    through(function (data) {
      this.emit('error', err)
    }),
    pull.drain(null, function (_err) {
      t.equal(_err, err)
      t.end()
    })
  )
})

tape('through', function (t) {
  pull(
    pull.values([1,2,3]),
    through(function (data) {
      this.queue(data * 10)
    }),
    pull.collect(function (err, ary) {
      if(err) throw err
      t.deepEqual(ary, [10, 20, 30])
      t.end()
    })
  )
})

tape('through + end', function (t) {
  pull(
    pull.values([1,2,3]),
    through(function (data) {
      this.queue(data * 10)
    }, function () {
      this.queue(40)
      this.queue(null)
    }),
    pull.collect(function (err, ary) {
      if(err) throw err
      t.deepEqual(ary, [10, 20, 30, 40])
      t.end()
    })
  )
})

tape('range error', function (t) {

  var n = 0
  pull(
    pull.count(1000000),
    through(function (data) {
      n += data
    }),
    pull.drain(null, function () {
      console.log(n)
      t.equal(500000500000, n)
      t.end()
    })
  )

})

tape('pass error through', function (t) {

  var err = new Error('testing errors')

  pull(
    pull.error(err),
    through(console.log),
    pull.drain(null, function (_err) {
      t.equal(_err, err)
      t.end()
    })
  )

})
