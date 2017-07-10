<<<<<<< HEAD
var	config = require('../config'),
  DictDistrict = require('../models/dictDistrict')

exports.getDistrict = function (req, res) {
  var level = req.query.level
  var province = req.query.province
  var city = req.query.city
  var district = req.query.district
  var name = req.query.name

  var query = {}
  if (level != '' && level != undefined)	{
    query['level'] = level
  }
  if (province != '' && province != undefined)	{
    query['province'] = province
  }
  if (city != '' && city != undefined)	{
    query['city'] = city
  }
  if (district != '' && district != undefined)	{
    query['district'] = district
  }
  if (name != '' && name != undefined)	{
=======

var DictDistrict = require('../models/dictDistrict')

exports.getDistrict = function (req, res) {
  var level = req.query.level
  var province = req.query.province
  var city = req.query.city
  var district = req.query.district
  var name = req.query.name

  var query = {}
  if (level !== '' && level !== undefined) {
    query['level'] = level
  }
  if (province !== '' && province !== undefined) {
    query['province'] = province
  }
  if (city !== '' && city !== undefined) {
    query['city'] = city
  }
  if (district !== '' && district !== undefined) {
    query['district'] = district
  }
  if (name !== '' && name !== undefined) {
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
    query['name'] = name
  }
  DictDistrict.getSome(query, function (err, items) {
    if (err) {
<<<<<<< HEAD
      		return res.status(500).send(err.errmsg)
    	}
    	res.json({results: items})
=======
      return res.status(500).send(err.errmsg)
    }
    res.json({results: items})
>>>>>>> e6fe93318624b841b2b8d43610dac484be8b2832
  })
}
