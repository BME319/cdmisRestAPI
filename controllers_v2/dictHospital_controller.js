
var DictHospital = require('../models/dictHospital')

exports.getHospital = function (req, res) {
  var locationCode = req.query.locationCode
  var hostipalCode = req.query.hostipalCode
  var province = req.query.province
  var city = req.query.city

  var query = {}
  if (locationCode !== '' && locationCode !== undefined) {
    query['locationCode'] = locationCode
  }
  if (hostipalCode !== '' && hostipalCode !== undefined) {
    query['hostipalCode'] = hostipalCode
  }
  if (province !== '' && province !== undefined) {
    query['province'] = province
  }
  if (city !== '' && city !== undefined) {
    query['city'] = city
  }
  // console.log(query);

  DictHospital.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err.errmsg)
    }
    res.json({results: items})
  })
}
// db.getCollection('dicthospitals').remove({ 'alias' : null });
// mongoimport -h 121.43.107.106:27017 -u rest -p zjubme319 -d cdmis -c dicthospitals --headerline --type csv --file dictHospital.csv
