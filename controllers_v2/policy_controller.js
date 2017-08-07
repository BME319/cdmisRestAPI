var Policy = require('../models/policy')

// 获取患者列表
exports.getPatients = function (req, res) {
  let status = Number(req.query.status || null)
  let _name = req.query.name || null
  let query = {}
  if (status !== null || status !== undefined || status !== '') {
    query['status'] = status
  }
  let opts = ''
  let fields = {}
  // 通过子表查询主表，定义主表查询路径及输出内容
  let populate = {path: 'patientId', select: {'_id': 0, 'name': 1, 'gender': 1, 'phoneNo': 1, 'VIP': 1, 'birthday': 1}}
  // 模糊搜索
  if (_name) {
    let nameReg = new RegExp(_name)
    populate['match'] = {'name': nameReg}
  }
  Policy.getSome(query, function (err, items) {
    if (err) {
      return res.status(500).send(err)
    } else {
      let returns = []
      for (let item in items) {
        if (items[item].patientId !== null) {
          returns.push(items[item])
        }
      }
      res.json({data: returns, code: 0})
    }
  }, opts, fields, populate)
}
