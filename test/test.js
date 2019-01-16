/* global describe, it */

const XlsxStreamReader = require('../index')
const fs = require('fs')
const assert = require('assert')
const path = require('path')

describe('The xslx stream parser', function () {
  it('parses large files', function (done) {
    var workBookReader = new XlsxStreamReader()
    fs.createReadStream(path.join(__dirname, 'big.xlsx')).pipe(workBookReader)
    workBookReader.on('worksheet', function (workSheetReader) {
      workSheetReader.on('end', function () {
        assert(workSheetReader.rowCount === 80000)
        done()
      })
      workSheetReader.process()
    })
  })
  it('supports predefined formats', function (done) {
    var workBookReader = new XlsxStreamReader()
    fs.createReadStream(path.join(__dirname, 'predefined_formats.xlsx')).pipe(workBookReader)
    const rows = []
    workBookReader.on('worksheet', function (workSheetReader) {
      workSheetReader.on('end', function () {
        assert(rows[1][4] === '9/27/86')
        assert(rows[1][8] === '20064')
        done()
      })
      workSheetReader.on('row', function (r) {
        rows.push(r.values)
      })
      workSheetReader.process()
    })
  })
  it('supports custom formats', function (done) {
    var workBookReader = new XlsxStreamReader()
    fs.createReadStream(path.join(__dirname, 'import.xlsx')).pipe(workBookReader)
    const rows = []
    workBookReader.on('worksheet', function (workSheetReader) {
      workSheetReader.on('end', function () {
        assert(rows[1][2] === '27/09/1986')
        assert(rows[1][3] === '20064')
        done()
      })
      workSheetReader.on('row', function (r) {
        rows.push(r.values)
      })
      workSheetReader.process()
    })
  })
  it('catches zip format errors', function (done) {
    var workBookReader = new XlsxStreamReader()
    fs.createReadStream(path.join(__dirname, 'notanxlsx')).pipe(workBookReader)
    workBookReader.on('error', function (err) {
      assert(err.message === 'invalid signature: 0x6d612069')
      done()
    })
  })
  it('parses a file with no number format ids', function (done) {
    const workBookReader = new XlsxStreamReader()
    const rows = []
    fs.createReadStream(path.join(__dirname, 'nonumfmt.xlsx')).pipe(workBookReader)
    workBookReader.on('worksheet', function (workSheetReader) {
      workSheetReader.on('end', function () {
        assert(rows[1][1] === 'lambrate')
        done()
      })
      workSheetReader.on('row', function (r) {
        rows.push(r.values)
      })
      workSheetReader.process()
    })
  })
  it('parses a file with no workbook formatcodes and formatted date', function (done) {
    var workBookReader = new XlsxStreamReader()
    fs.createReadStream(path.join(__dirname, 'noformatcodes.xlsx')).pipe(workBookReader)
    const rows = []
    workBookReader.on('worksheet', function (workSheetReader) {
      workSheetReader.on('end', function () {
        assert(rows[1][5] === 3479942180)
        assert(rows[1][4] === '1/10/46')
        done()
      })
      workSheetReader.on('row', function (r) {
        rows.push(r.values)
      })
      workSheetReader.process()
    })
  })
  it('coerces numbers when not formatting', (done) => {
    var workBookReader = new XlsxStreamReader({ formatting: false })
    fs.createReadStream(path.join(__dirname, 'noformatcodes.xlsx')).pipe(workBookReader)
    const rows = []
    workBookReader.on('worksheet', function (workSheetReader) {
      workSheetReader.on('end', function () {
        assert(rows[1][5] === 3479942180)
        done()
      })
      workSheetReader.on('row', function (r) {
        rows.push(r.values)
      })
      workSheetReader.process()
    })
  })
  it('optionally returns predefined cell format', (done) => {
    var workBookReader = new XlsxStreamReader({ returnFormats: true })
    const formats = []
    fs.createReadStream(path.join(__dirname, 'predefined_formats.xlsx')).pipe(workBookReader)
    const rows = []
    workBookReader.on('worksheet', function (workSheetReader) {
      workSheetReader.on('end', function () {
        assert(rows[1][4] === '9/27/86')
        assert(formats[1][4] === 'm/d/yy')
        assert(formats[1][8] === 'General')
        done()
      })
      workSheetReader.on('row', function (r) {
        formats.push(r.formats)
        rows.push(r.values)
      })
      workSheetReader.process()
    })
  })

  it('optionally returns custom cell formats', function (done) {
    var workBookReader = new XlsxStreamReader({ returnFormats: true })
    fs.createReadStream(path.join(__dirname, 'import.xlsx')).pipe(workBookReader)
    const rows = []
    const formats = []
    workBookReader.on('worksheet', function (workSheetReader) {
      workSheetReader.on('end', function () {
        assert(rows[1][2] === '27/09/1986')
        assert(rows[1][3] === '20064')
        assert(formats[1][2] === 'DD/MM/YYYY')
        assert(formats[1][3] === 'General')
        done()
      })
      workSheetReader.on('row', function (r) {
        formats.push(r.formats)
        rows.push(r.values)
      })
      workSheetReader.process()
    })
  })
})
