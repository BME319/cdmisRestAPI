// var webEntry = require('../settings').webEntry
// var dbUri = webEntry.dbUri
// var dbUrl = '121.43.107.106:28000/cdmis'
var dbUrl = 'localhost:28000/cdmis' // 服务器代码调试
// var dbUrl = 'localhost:27017/cdmis' // myMongoDB调试
// print(dbUrl);

db = connect(dbUrl)
// setTimeout(function(){console.log('33')}, 1000);

db.auth('rest', 'zjubme319')

print(dbUrl)

function add0 (m) {
  return m < 10 ? '0' + m : m
}

function schedule () {
  let counselItem = db.counsels.find({status: 1}).toArray()
  let now = new Date()
  // print(counselItem);

  let y = now.getFullYear()
  let m = now.getMonth() + 1
  let d = now.getDate()
  let h = now.getHours()
  let mm = now.getMinutes()
  let s = now.getSeconds()
  let nowstr = y + add0(m) + add0(d) + add0(h) + add0(mm) + add0(s)

  for (let i = 0; i < counselItem.length; i++) {
    let lastTime = now - counselItem[i].time

    let deadLine = 1000 * 60 * 60 * 24  // 咨询超时为24小时
    if (counselItem[i].type === 6 || counselItem[i].type === 7) {
      // db.counsels.update({counselId: counselItem[i].counselId}, {$set: {status: 0, endTime: now}})
      deadLine = 1000 * 60 * 60 * 2     // 加急咨询超时为2小时
    }

    // if (lastTime > (1000*60*60*24)) {
    if (lastTime > deadLine) {
      // 插入超时未回复表
      db.counselautochangestatuses.insert(counselItem[i])
      // 查询相关科室信息
      let departmentItem = db.departments.find({doctors: counselItem[i].doctorId}).toArray()
      // 查询医生回复次数
      let cmudoc = db.allusers.find({_id: counselItem[i].doctorId}).toArray()[0].userId
      let cmupat = db.allusers.find({_id: counselItem[i].patientId}).toArray()[0].userId
      let count_of_reply = db.communications.find({sendBy:cmudoc, receiver:cmupat, sendDateTime:{$gt:counselItem[i].time}}).toArray().length
      // 插入科主任、结束时间、超时类型、更改状态为0
      if (departmentItem.length === 0) { // 若该医生不存在科室
        db.counselautochangestatuses.update({counselId: counselItem[i].counselId}, {$set: {status: 0, endTime: now, timeouttype: 1, reply: count_of_reply}})
      } else {
        db.counselautochangestatuses.update({counselId: counselItem[i].counselId}, {$set: {departLeader: departmentItem[0].departLeader, status: 0, endTime: now, timeouttype: 1, reply: count_of_reply}})
      }
      // 更改counsel表的状态为0，插入结束时间
      db.counsels.update({counselId: counselItem[i].counselId}, {$set: {status: 0, endTime: now}})
      // 更改consultation表状态
      db.consultations.update({diseaseInfo: counselItem[i]._id}, {$set: {status: 0}}, {multi: true})
      // 更改account表times.count
      db.accounts.update({userId:cumpat}, {$pull:{times:{doctorId:cmudoc}}})
      db.accounts.update({userId:cumpat}, {$push:{times:{doctorId:cmudoc, count:0}}})
      printjson({'result': 'change_status_success', 'counselId': counselItem[i].counselId})
      // 存消息
      // 查找患者与医生的ID
      // 二期代码应该是alluser
      // let messagedoc = db.doctors.find({_id: counselItem[i].doctorId}).toArray()
      let messagedoc = db.allusers.find({_id: counselItem[i].doctorId}).toArray()
      print(counselItem[i].doctorId)
      print(counselItem[i].patientId)
      // let messagepat = db.patients.find({_id: counselItem[i].patientId}).toArray()
      let messagepat = db.allusers.find({_id: counselItem[i].patientId}).toArray()
      let endlMsg = {
        type: '',
        info: '',
        docId: '',
        counselType: 0, 
        counselId: counselItem[i].counselId
      }
      if (counselItem[i].type === 1) {
        endlMsg = {
          type: 'endl',
          info: '已满24小时，咨询自动结束',
          docId: messagedoc[0].userId,   // 医生 id
          counseltype: 1
        }
      } else if (counselItem[i].type === 2 || counselItem[i].type === 3) {
        endlMsg = {
          type: 'endl',
          info: '已满24小时，问诊自动结束',
          docId: messagedoc[0].userId,    // 医生id
          counseltype: 2,
          counselId: counselItem[i].counselId
        }
      } else if (counselItem[i].type === 6 || counselItem[i].type === 7) {
        endlMsg = {
          type: 'endl',
          info: '已满2小时，加急咨询自动结束',
          docId: messagedoc[0].userId,    // 医生id
          counseltype: 6,
          counselId: counselItem[i].counselId
        }
      }
      let msgJson = {
        clientType: 'doctor',
        contentType: 'custom',
        fromID: messagedoc[0].userId,     // 医生id
        fromName: messagedoc[0].name,   // 医生名字
        fromUser: {
        },
        targetID: messagepat[0].userId,    // 患者id
        targetName: messagepat[0].name,   // 患者名字
        targetType: 'single',
        status: 'send_going',
        createTimeInMillis: Date.now(),    // js自带的取时间方法
        newsType: '11',
        targetRole: 'patient',
        content: endlMsg
      }
      // printjson({msgJson: msgJson})
      let messageNo = 'END' + nowstr + i
      // printjson({messageNo:messageNo, i:i})
      let messageType = 1
      let sendBy = messagedoc[0].userId
      let receiver = messagepat[0].userId
      let sendDateTime = msgJson.createTimeInMillis
      let communicationItem = {
        messageNo: messageNo,
        messageType: 1,
        sendBy: sendBy,
        sendByRole: 'doctor',
        receiver: receiver,
        receiverRole: 'patient',
        sendDateTime: sendDateTime,
        newsType: '11',
        content: msgJson
      }
      // printjson({communicationItem:communicationItem})
      db.communications.insert(communicationItem)
      // news表插入数据
      let newsItem = {
        messageId: communicationItem.messageNo,
        userId: communicationItem.receiver,
        userRole: communicationItem.receiverRole,
        sendBy: communicationItem.sendBy,
        readOrNot: 0,
        type: 11,
        time: communicationItem.sendDateTime,
        title: endlMsg.info,
        description: endlMsg.info, 
        url: JSON.stringify(communicationItem.content)
      }
      db.news.insert(newsItem)
    }
  }
  printjson({'result': 'runbat_success', 'dbUrl': dbUrl, 'time': now})
  // schedule();
}

schedule()
