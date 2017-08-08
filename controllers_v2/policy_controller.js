var Policy = require('../models/policy')
var Alluser = require('../models/alluser')

// 获取用户对象 添加保险专员／主管角色 2017-08-08 YQC
exports.getSessionObject = function (req, res, next) {
  let query = {userId: req.session.userId}
  Alluser.getOne(query, function (err, user) {
    if (err) {
      return res.status(500).send(err)
    }
    if (user === null) {
      return res.status(404).send('User Not Found')
    } else if (req.session.role === 'patient') {
      req.body.patientObject = user
      next()
    } else if (req.session.role === 'doctor') {
      req.body.doctorObject = user
      next()
    } else if (req.session.role === 'insuranceA') {
      req.body.insuranceAObject = user
      next()
    } else if (req.session.role === 'insuranceC') {
      req.body.insuranceCObject = user
      next()
    } else {
      return res.status(400).send('Role of the User is not a doctor / patient / insuranceA / insuranceC')
    }
  })
}

// 保险专员／主管获取患者列表 专员只能获取自己负责的患者，主管可获取所有患者 2017-08-08 YQC
exports.getPatients = function (req, res) {
  let status = Number(req.query.status || null)
  let _name = req.query.name || null
  let query = {}
  if (req.session.role === 'insuranceA') {
    query['currentAgent'] = req.body.insuranceAObject._id
  }
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
