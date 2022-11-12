const mysql = require('mysql');

var pool = mysql.createPool({
    host:'44.205.233.21',
    user:'admin',
    password:'admin',
    port:3306,
    database:'webservice'
});

module.exports = {
    pool
 };