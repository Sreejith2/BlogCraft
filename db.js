import pg from "pg";
const db= new pg.Client({
    user:'postgres',
    host:'localhost',
    database:'world',
    password:'123456',
    port:5433
});

db.connect()

db.query("SELECT * FROM blog_posts",(err,res)=>{
    if(err){
        console.log("Error occurred",err.stack);
    }else{
        const data=res.rows;
        console.log(data)
    }
    db.end();
});


    

