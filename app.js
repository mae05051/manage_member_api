const express = require('express') 
const bodyParser=require('body-parser')
const cookieParser = require('cookie-parser')
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require("./db");

const app = express()
const port = 5000
const path = __dirname + '/static';
const SECRET_KEY = "rlawngks";

app.use(cookieParser())
app.use(bodyParser.json()); 
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}))
app.use('/view', express.static(path))

app.listen(port, () => {
  console.log(`MBTI TEST http://localhost:${port}`)
})

//TEST
app.get('/', (req, res) => { 
  res.send('Hello TEST!')
})

//회원가입 페이지
app.get('/signup',(req,res)=>{
  res.sendFile(path+'/signup.html');
})

//로그인 페이지
app.get('/login',(req,res)=>{
  res.sendFile(path+'/login.html');
})

app.get('/mainpage',(req,res)=>{
  res.sendFile(path+'/mainpage.html');
})

//중복아이디 체크
app.post('/api/checkid',(req,res)=>{
  let ID=req.body.id
  let sql=` select * from member where id= '${ID}' `
  db.pool.query(sql, (err, rows)=>{
      if (err) console.log(err);
      
      if (rows.length==0){//가입 가능한 유저라면,
        res.json({'same' : false})
      }else{
        //console.log(rows[0].ID)
        res.json({'same' : true})
      }
  })
})

app.post('/api/signup',async (req,res)=>{
  let data = req.body
  const { password, salt } = await createHashedPassword(data.pw);
  data['PASSWORD']=password
  data['SALT']=salt
  let sql_insert_user=`insert into member values('${data.id}','${data.PASSWORD}','${data.SALT}')`
  db.pool.query(sql_insert_user, (err, rows)=>{
    if (err) {
      console.log(err)
      res.json({'status' : false});
    }else{
      res.json({'status' : true})
    }
  })
})

app.post('/api/login',async (req,res)=>{
  id=req.body.id
  pw=req.body.pw
  let sql_pwd=`select password,salt from member where id='${id}'`
  db.pool.query(sql_pwd, async (err, rows)=>{
    if (err) {
      console.log(err)
    }else if (rows.length==0) {
      res.json({'success' : 'id_false'});
    }else{
      let salt = rows[0]['salt']
      let answer_password=rows[0]['password']
      let cur_password = await makePasswordHashed(pw,salt);
      if (answer_password==cur_password){
        //jwt 생성
        const token = jwt.sign({
            type: 'JWT',
            id:id,
            }, SECRET_KEY, { expiresIn: '20m' }  
        );
        //전송
        res.json({'success' : true, 'id':id, 'token': token});
      }else{
        res.json({'success' : 'pw_false'});
      }
    }
  })
})

//보안관련 - 비밀번호 암호화
const createSalt = () =>
    new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buf) => {
            if (err) reject(err);
            resolve(buf.toString('base64'));
        });
    });

const createHashedPassword = (plainPassword) =>
    new Promise(async (resolve, reject) => {
        const salt = await createSalt();
        crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
            if (err) reject(err);
            resolve({ password: key.toString('base64'), salt });
        });
    });

const makePasswordHashed = (plainPassword,salt) =>
    new Promise(async (resolve, reject) => {
        crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
            if (err) reject(err);
            resolve(key.toString('base64'));
        });
    });