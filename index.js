import express from "express"
import bodyParser from "body-parser"
import { fileURLToPath } from "url"
import { dirname } from "path"
import path from "path"
import pg from "pg"



const __filename=fileURLToPath(import.meta.url)
const __dirname=dirname(__filename)


// DATABASE
const db=new pg.Client({
    user:'postgres',
    host:'localhost',
    password:'123456',
    database:'world',
    port:5433
})

db.connect()

function addBlog(blog){
    db.query(`INSERT INTO blog_posts (title,content,id) VALUES('${blog.blogHeading}','${blog.blogContent}',uuid_generate_v4())`,(err,res)=>{
        if(err){
            console.log("Add post failed",err.stack)
        }else{
            console.log("Blog added successfully");
        }
        // db.end();
    });
}

function deleteBlog(id){
    db.query(`DELETE FROM blog_posts WHERE id='${id}'`,(err,res)=>{
        if(err){
            console.log("Delete failed",err.stack)
        }else{
            console.log("Blog deleted successfully")
        }
        // db.end();
    });
}
async function searchBlog(id) {
  return new Promise((rs, rj) => {
      db.query(`select * from blog_posts where id='${id}'`,(err, res) =>{
           if(err) {
              console.log("Error", err.stack);
              rj(err);
           }
          rs(res.rows[0]); 
      });
  });
}

async function getAllPosts(){
    return new Promise((rs,rj)=>{
        db.query(`select * from blog_posts`,(err,res)=>{
            if(err){
                rj(err);
            }
            rs(res.rows);
        });
    });
}

async function updateBlog(id,blog){
    db.query(`update blog_posts set title='${blog.blogHeading}',content='${blog.blogContent}' where id='${id}'`,(err,res)=>{
        if(err){
            console.log("Update error",err)
        }
        console.log("Updated");
    });
}


const app=express()
const port=3000
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,"public")))
app.set('view engine','ejs')

// HOME-PAGE
app.get("/",(req,res)=>{
    res.render('index')
})

app.get("/view-all-posts",async (req,res)=>{
    try{
        const posts=await getAllPosts()
        res.render('view-all-posts',{posts:posts})
    }catch(err){
        console.log("Errror",err)
    }
})


// VIEW-SELECTED-POST
app.get("/view-post/:id",async (req,res)=>{
    const postId = req.params.id
    try{
        const viewPost= await searchBlog(postId)
        if(!viewPost){
            return res.status(404).send("Blog not found")
        }
        res.redirect(`/view-post?id=${postId}`)
    }catch(err){
        console.log("Error",err)
    }
})

app.get("/view-post", async (req,res)=>{
    try{
        const postId=req.query.id
        const viewPost= await searchBlog(postId)
        res.render('post',{post:viewPost})
    }catch(err){
        console.log("Error occured",err);
    }
})


// POSTING A BLOG
app.post("/post-blog",(req,res)=>{
    const newPost={...req.body}
    addBlog(newPost);
    res.redirect('/view-all-posts')
})

// DELETING A BLOG
app.get("/delete/:id",(req,res)=>{
    const id=req.params.id
    deleteBlog(id)
    res.redirect("/view-all-posts")
})

//EDITING A BLOG
app.get("/edit/:id",(req,res)=>{
    const id=req.params.id
    res.redirect(`/edit-form?id=${id}`)
})

app.get("/edit-form",async (req,res)=>{
    const id=req.query.id
    const editPost=await searchBlog(id)
    res.render('editForm',{post:editPost})
})

app.post("/update-blog/:id",async (req,res)=>{
    const id=req.params.id
    const newContent=req.body
    await updateBlog(id,newContent)
    res.redirect("/view-all-posts")
})


app.listen(port,()=>{
    console.log(`server running at port http://localhost:${port}`)
})