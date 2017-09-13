
var dbUrl = 'localhost:28000/cdmis'
print(dbUrl)

db = connect(dbUrl)

db.auth('rest', 'zjubme319')

db.getCollection('allusers').find().forEach(
    function (item) {
      var userId = item.userId || null
      var roles = item.role || null

      db.getCollection('rbac_meta').update({'key': 'users'}, {$set: {[userId]: true}})

      // db.getCollection('rbac_meta').find({'key': 'users'}).forEach(function (meta) {
      // 	meta[userId] = true
      // 	db.getCollection('rbac_meta').insert(meta)
      // })

      for (let i = 0; i < roles.length; i++) {
      	// db.getCollection('rbac_roles').find({'key': roles[i]}).forEach(function (role) {
	      // 	role[userId] = true
	      // 	db.getCollection('rbac_roles').insert(role)
	      // })
      	db.getCollection('rbac_roles').update({'key': roles[i]}, {$set: {[userId]: true}})
      	db.getCollection('rbac_users').update({'key': userId}, {$set: {[roles[i]]: true}}, {upsert: true})
      	// db.getCollection('rbac_users').find({'key': userId}).forEach(function (user) {
	      // 	user[roles[i]] = true
	      // 	db.getCollection('rbac_users').insert(user)
	      // })
      }
    }
)
