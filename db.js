const mysql = require('mysql');
require('dotenv').config()

var pool =mysql.createPool({
    host: process.env.mysql_host,
    user: process.env.mysql_user,
    password: process.env.mysql_password,
    port: process.env.mysql_port,
    database: process.env.mysql_database
})

module.exports = {
    pool
 };