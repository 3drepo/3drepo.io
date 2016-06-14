var dbs = db.getMongo().getDBNames();
dbs.forEach(function(dbname){
	db.getSiblingDB(dbname).dropDatabase();
});
