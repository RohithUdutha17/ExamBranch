var express = require('express');
var mysql = require('mysql');
var alert = require('alert')
var fs = require('fs');

const { log } = require('console');
const { stringify } = require('querystring');
var path = require('path');
const { json } = require('express');
const { resolve } = require('path');
const { rejects } = require('assert');
var app = express()
app.set('views',path.join(__dirname,'/public/views'));
app.set('view engine','ejs');
console.log(__dirname+'/views');
app.engine('html',require('ejs').renderFile);
//create connection 
var con = mysql.createConnection(
    {
        host:"localhost",
        user:"root",
        password:"",
        database:"examination"
    }
)

con.connect((err)=>{
    if(err){
        console.log("Error");
    }
    else{
        console.log("connected succesfully!");
    }
})

var index = fs.readFileSync('./index.html');
var account = fs.readFileSync('./account.html');
var home = fs.readFileSync("./home.html");
var account1 = fs.readFileSync("./account1.html");
var payment = fs.readFileSync("./payment.html");
var timetable = fs.readFileSync("./timetable.html");
var hallticket = fs.readFileSync("./hallticket.html");
var seating = fs.readFileSync("./seating.html");
var hallticket1 = fs.readFileSync("./hallticket1.html");
var results = fs.readFileSync("./results.html");
var studentresults = fs.readFileSync("./studentresults.html");
var studentseats = fs.readFileSync("./studentseat.html");

app.use(express.static(__dirname+'/public'));
app.use(express.urlencoded({extended:true}))

function logger(req,res,next){
    var id = req.body.ex_id;
    var name = req.body.ex_name;
    var password = req.body.password;
    var role = req.body.role;
    var mobile = req.body.mobile_no;
    console.log(mobile);
    
            con.query("Insert into examiner(Ex_id,Ex_name,Password,Role,Mobile_no)values('"+id+"','"+name+"','"+password+"','"+role+"','"+mobile+"')",(err,result)=>{
                if(err){
                    console.log("Error2");
                }
                else{
                    console.log(result);
                    console.log("Inserted");
                }
            })
    next();
}

app.get('/',(req,res)=>{
    res.writeHead(200,"Content-Type : text/html");
    res.write(index);
    res.end();
})

app.get('/account',(req,res)=>{
    res.writeHead(200,"Content-Type : text/html");
    res.write(account);
    res.end();
})

app.get('/register',(req,res)=>{
    res.writeHead(200,"Content-Type : text/html");
    res.write(account);
    res.end();
})
app.get('/login',(req,res)=>{
    res.writeHead(200,"Content-Type : text/html");
    res.write(account1);
    res.end();
})

app.get('/studentresults',(req,res)=>{
    res.writeHead(200,"Content-Type : text/html");
    res.write(studentresults);
    res.end();
    
})

var fetchresult = (req,res,next)=>{
    var htno = req.body.htno;
    var yearsem = req.body.yearsem;
    con.query("select * from results join grade_point on results.total=grade_point.total join grade on grade_point.gradepoint=grade.gradepoint join subject on subject.sub_code=results.sub_code where results.roll_no=? and results.yearsem=? order by results.sub_code",[htno,yearsem],(err,result)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log(result);
            for(let i=0;i<result.length;i++){
                if(!(result[i].Total[i]>40) && !(result[i].Ext_marks>=27))
                {
                    result[i].Gradepoint = 0;
                    result[i].Grade = 'F';
                }
            }
            res.render('studentresults.html',{data:result});
        }
    })
}

app.post('/studentresults',fetchresult,(req,res)=>{

})

app.get('/studentseats',(req,res)=>{
    res.writeHead(200,"Content-Type : text/html");
    res.write(studentseats);
    res.end();
    
})

 async function findseat(req,res,next){
    var rollno = req.body.rollno;
    var sum=0;
    var index;
    var resu = [];
    for(let k=0;k<rollno.length-3;k++){
       if(rollno[k].match(/[a-zA-Z]/)){
        sum+=rollno.charCodeAt(k);
       }
       else{
           sum+=Number(rollno[k]);
       }
    }
    sum+=Number(rollno.slice(7,10));
    function uuu(){
        return new Promise((resolve,reject)=>{
        con.query("select * from seats",(err,result)=>{
        if(err){
            console.log(err);
        }
        else{
            resu = result;
            console.log(resu);
            //console.log(result,result[0].From.length);
            var from=[];
            var to =[];
            for(let i=0;i<result.length;i++){
                var sum1=0;
                var sum2=0;
                console.log(result[i]);
                for(let j=0;j<result[i].From.length-3;j++){
                    if((result[i].From[j]).match(/[a-zA-Z]/)){
                    sum1+=result[i].From.charCodeAt(j);
                    sum2+=result[i].To.charCodeAt(j);
                    }
                    else{
                        sum1+=Number(result[i].From[j]);
                        sum2+=Number(result[i].To[j]);
                    }
                }
                sum1+=Number(result[i].From.slice(7,10));
                sum2+=Number(result[i].To.slice(7,10));
                from[i]=sum1;
                to[i]=sum2;
                console.log(from,to,sum);
            }
            for(let i=0;i<from.length;i++){
                if(from[i]<= sum && to[i]>=sum){
                    console.log(result[i].Roomno,result[i].Deptname);
                    index = i;
                }
            }
            resolve(result);        
        }
    })
    })
}
    
    await uuu();
    console.log(resu,index);
    res.render('studentseat.html',{data:{room:resu[index].Roomno,dept:resu[index].Deptname,rn:rollno}});   

    res.end();
    next();
}

app.post('/studentseats',findseat,(req,res)=>{

})

app.post('/login',logger,(req,res)=>{
    //console.log(req.body);
    
    res.writeHead(200,"Content-Type : text/html");
    res.write(account1);
    res.end(); 
})
app.get('/home/payment',(req,res)=>{
    res.writeHead(200,"Content-Type : text/html");
    res.write(payment);
    res.end(); 
    
})

var check = (req,res,next)=>{
    var roll = req.body.roll_no;
    con.query("Select status from payment where Roll_no=?",[roll],(err,result,fields)=>{
        if(err){
            console.log("Error"+err);
        }
        else if(result[0].status == 'paid'){
            alert(result[0].status);
            res.redirect('/home/hallticket');
            res.end();
        }
        else{
            console.log(result[0].status);
            alert(result[0].status);
            res.redirect('/home/payment');
            res.end()
        }
    })
    next();
}


app.post('/home/payment',check,(req,res)=>{
    
})

app.get('/home',(req,res)=>{
    res.writeHead(200,"Content-Type : text/html");
    res.write(home);
    res.end(); 
    
})

function login(req,res,next){
    var name1 = req.body.ex_name1;
    var password1 = req.body.password1;
    console.log(name1,"  ",password1);
            con.query("select * from examiner where Ex_name=? and Password=?",[name1,password1],(err,result,fields)=>{
                if(err){
                    console.log("Error2");
                }
                else{
                    res.writeHead(200,"Content-Type : text/html");
                    console.log(result.length);
                    if(result.length == 0){
                        alert("details not matched");
                        res.write(account);
                        res.end();
                    }
                    else{
                        res.write(home);
                        res.end(); 
                        
                        console.log("Logging in");
                    }
                }
            })
    next();
}

app.post('/home',login,(req,res)=>{
 
})

app.get('/home/timetable',(req,res)=>{
    res.writeHead(200,"Content-Type : text/html");
    res.write(timetable);
    res.end(); 

})

var store = (req,res,next)=>{
    var date = req.body.date;
    var yearsem = req.body.year;
    var civil = req.body.civil;
    var eee = req.body.eee;
    var mec = req.body.mec;
    var ece = req.body.ece;
    var cse = req.body.cse;
    var eie = req.body.eie;
    console.log(date,date.length);
    for(let i=0;i<date.length;i++){
        if(date != '' || yearsem != ''){
        con.query("insert into timetable(Date,YearSem,CIVIL,EEE,MEC,ECE,CSE,EIE)values('"+date[i]+"','"+yearsem[i]+"','"+civil[i]+"','"+eee[i]+"','"+mec[i]+"','"+ece[i]+"','"+cse[i]+"','"+eie[i]+"')",(err,result)=>{
            if(err){
                console.log("error"+err);
            }
            else{
                console.log("Timetable saved");
                
            }
        })
    }
    }
    alert("Timetable saved");
    res.redirect('/home/timetable');
    res.end();
    next();
}

app.post('/home/timetable',store,(req,res)=>{
    res.end();
})

app.get('/home/hallticket',(req,res)=>{
    res.writeHead(200,"Content-Type : text/html");
    res.write(hallticket);
    res.end(); 
})

app.get('/home/hallticket/issue',(req,res)=>{
    res.writeHead(200,"Content-Type : text/html");
    res.write(hallticket1);
    res.end(); 
    
})


var check1 = (req,res,next)=>{
    var roll1 = req.body.roll_no1;
    con.query("Select status from hallticket where HT_no=?",[roll1],(err,result,fields)=>{
        if(err){
            console.log("Error"+err);
        }
        else if(result[0].status == 'issued'){
            alert(result[0].status);
            res.redirect('/home/payment'); 
            res.end();   
        }
        else{
            console.log(result[0].status);
            res.redirect('/home/hallticket/issue');    
            res.end();
        }
    })
    
    next()
}

app.post('/home/hallticket',check1,(req,res)=>{

})


var issue  = (req,res,next)=>{
    var rollno = req.body.roll_no2;
    con.query("update hallticket set status='issued' where HT_no=?",[rollno],(err,result)=>{
        if(err){
            console.log(err);
        }
        else{
            alert("status updated successfully");
        }
    })
    res.redirect('/home/payment');
    res.end();
    next();
}

app.post('/home/hallticket/issue',issue,(req,res)=>{

})

app.get('/home/seating',(req,res)=>{
    res.writeHead(200,"Content-Type : text/html");
    res.write(seating);
    res.end(); 
    
})

var storeseats = (req,res,next)=>{
    
    var from = req.body.from;
    console.log(typeof(from));
    if(typeof(from)==='string'){
        var from = [req.body.from];
        var to = [req.body.to];
        var room_no = [req.body.room_no];
        var dept_name = [req.body.dept_name];
        var invigilator = [req.body.invigilator];

    }
    else{
        var from = req.body.from;
        var to = req.body.to;
        var room_no = req.body.room_no;
        var dept_name = req.body.dept_name;
        var invigilator = req.body.invigilator;

    }
        for(let i=0;i<from.length;i++){
        console.log(from[i]);
        console.log(to[i]);
        console.log(room_no[i]);
        con.query("insert into seats(`From`,`To`,Roomno,Deptname,Invigilator)values('"+from[i]+"','"+to[i]+"','"+room_no[i]+"','"+dept_name[i]+"','"+invigilator[i]+"')",(err,result)=>{
            if(err){
                console.log("error"+err);
                alert(err);
            }
            else{
                console.log("seats saved");
                alert("seats saved"); 
            }
        })
    }
    res.redirect('/home/seating');
    res.end();
    next();
    
}

app.post('/home/seating',storeseats,(req,res)=>{
    
})

app.get('/home/results',(req,res)=>{
    res.writeHead(200,"Content-Type : text/html");
    res.write(results);
    res.end(); 
    
})

var getsub = (req,res,next)=>{
    var rn = req.body.rollno;
    var ys = req.body.yearsem;
    var sub = req.body.subname;
    var sub = "hello";
    console.log(req.body);
    console.log(rn,ys,sub);
    var dept = rn.slice(7,8);
    var deptnames = ['CIVIL','EEE','MEC','ECE','CSE','EIE'];
    var deptname='';
    for(let i=1;i<7;i++){
        if(dept == String(i)){
            deptname = deptnames[i-1];
            break;
        }
    }
    console.log(deptname);
    con.query("select sub_name from subject where yearsem=? and Deptname=? order by sub_code",[ys,deptname],(err,result,fields)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log(result,result[0].sub_name);
            res.render('results.html',{data:{d:result,subj:sub,Rollno:rn,YS:ys}});
            res.end();
        }
    })
   
    next();
}

app.post('/home/results',getsub,(req,res)=>{

})

var result = (req,res,next)=>{
    var yearsem = req.body.yearse;
    var rollno = req.body.rolln;
    var subname = req.body.subname;
    var intmarks = req.body.intmarks;
    var extmarks = req.body.extmarks;
    console.log(yearsem,rollno,intmarks,extmarks,subname);
    // var subid;
    var dept = rollno.slice(7,8);
    var deptnames = ['CIVIL','EEE','MEC','ECE','CSE','EIE'];
    var deptname='';
    for(let i=1;i<7;i++){
        if(dept == String(i)){
            deptname = deptnames[i-1];
            break;
        }
    }
    var count=0;
    var total=[];
    for(let i=0;i<subname.length;i++){
        total[i]=Number(intmarks[i])+Number(extmarks[i]);
    }
    for(let i=0;i<subname.length;i++){
        console.log(total[i]);
        con.query("select sub_code from subject where yearsem=? and deptname=? order by sub_code",[yearsem,deptname],(err,result)=>{
            if(err){
                count+=1;
                console.log(err);
                alert(err);
            }
            else{ 
                console.log(result);
        
        con.query("insert into results(Roll_no,sub_code,Int_marks,Ext_marks,Total,credits,yearsem)values('"+rollno+"','"+result[i].sub_code+"','"+intmarks[i]+"','"+extmarks[i]+"','"+total[i]+"','','"+yearsem+"')",(err,result1)=>{
            if(err){
                count+=1;
                console.log(err);
                alert(err);
            }            
            else{
                if(total[i]>=40 && extmarks[i]>=27){
                    con.query("select sub_credits from subject join results on subject.sub_code=results.Sub_code",(err,result2,fields)=>{
                        if(err){
                            count+=1;                            
                           console.log(err);
                            alert(err);
                        }
                        else{
                            console.log(result2[i].sub_credits);
                            con.query("update results set Credits=? where Roll_no=? and Sub_code=?",[result2[i].sub_credits,rollno,result[i].sub_code],(err,result)=>{
                                if(err){
                                    count+=1;
                                    console.log(err);
                                    alert(err);
                                }
                                else{

                                }
                            })
                        }
                    })   
                }
            
            }
        })
    
    }
    
})

}
if(count==0){
    alert("result updated successfully");
}
    res.redirect('/home/results');
    res.end();
    next();
}


app.post('/home/results/submit',result,(req,res)=>{

})

app.listen(8000);