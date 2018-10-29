// importing named exports we use brackets
import { createPostTile, uploadImage } from './helpers.js';

// Potential example to upload an image
const input = document.querySelector('input[type="file"]');
input.addEventListener('change', uploadImage);

// --------------------------------my function----------------------------
//my own function
function getId(id){
    var i = document.getElementById(id)
    return i;
};

//get id from username
function getUsrId(name){
    let url = `http://127.0.0.1:5000/user/?username=${name}`
    fetch(url,{
        method:'GET',
        headers:{
            'Authorization': "Token " + window.localStorage.TOKEN,
            "Content-Type":"application/json"
        }
    })
    .then(res=>{
        if(res.status === 403) {
            alert("Invalid Auth Token");
            getId("login").style.display="block";
            getId("mainpage").style.display="none";
            throw 0
        }
        if(res.status === 200) {
            return res.json()
        }
    })
    .then(json=>{
        window.localStorage.myId = json.id
    })
}

// fetch feed
function getFeedData(start,num){
    let url = `http://127.0.0.1:5000/user/feed?p=${start}&n=${num}`
    fetch(url,{
        method:'GET',
        headers:{
            'Authorization': "Token " + window.localStorage.TOKEN,
            "Content-Type":"application/json"
        }
    })
    .then(res=>{
        if(res.status === 403) {
            alert("Invalid Auth Token");
            getId("login").style.display="block";
            getId("mainpage").style.display="none";
            throw 0
        }
        if(res.status === 200) {
            return res.json()
        }
    })
    .then(json=>{
        // getId("large-feed").innerHTML ="";
        if (json.posts.length == 0) {
            console.log(json.posts.length);
            window.localStorage.feed = 0;
        }else{
            window.localStorage.feed = 1;
            for(var i = 0 ;i < json.posts.length;i++){
                const newpost = createPost(json.posts[i]);
                getId("large-feed").appendChild(newpost);
    
                let tmp = json.posts[i].id;
                getId(tmp).addEventListener("click",function(){// if click like, like it and change like style
                    if (getId(tmp).innerHTML == `<i class="material-icons" style="color:red">favorite_border</i>`){
                        console.log("addlike");
                        addLike(tmp);
                    }else if (getId(tmp).innerHTML == `<i class="material-icons" style="color:red">favorite</i>`){
                        console.log("unlike");
                        unLike(tmp);
                    }
                })
            }
        } 
    })
};

function freshLike(id){
    let url = `http://localhost:5000/post/?id=${id}`;
    fetch(url,{
        method:'GET',
        headers:{
            'Authorization': "Token " + window.localStorage.TOKEN,
            "Content-Type":"application/json"
        }
    })
    .then(res=>{
        if(res.status === 403) {
            alert("Invalid Auth Token");
            getId("login").style.display="block";
            getId("mainpage").style.display="none";
            throw 0
        }
        if(res.status === 200) {
            return res.json()
        }
    }).then(json=>{
        getId(id).nextSibling.innerText = `${json.meta.likes.length} likes`;
    })
    .catch(err=>{
        console.log(err)
    })
}


//post under large-feed
function createPost(post) {
    const section = document.createElement("section");
    section.className = "post";

    const title = document.createElement("h3");
    title.className = "post-title";
    title.innerText = post.meta.author;
    const contentTop = document.createElement("div");
    const time = document.createElement("h5");
    time.className = "post-time";
    time.innerText = "@"+ new Date(post.meta.published*1000).toLocaleString();
    // time.style
    contentTop.appendChild(title);
    contentTop.appendChild(time);
    section.appendChild(contentTop);
    
    const pic = document.createElement("img");
    pic.className = "post-image";
    pic.src = `data:image/png;base64,${post.src}`;
    pic.alt = post.meta.description_text;
    section.appendChild(pic);

    const contentBottom = document.createElement("div");
    const like = document.createElement("div");//like button
    like.className = "post-like";
    like.id = post.id;
    like.style = "float:left; margin:10px; margin-left:20px";
    like.innerHTML = `<i class="material-icons" style="color:red">favorite_border</i>`;
    for(var i=0; i<post.meta.likes.length; i++){
        if (window.localStorage.myId == post.meta.likes[i]){
            like.innerHTML = `<i class="material-icons" style="color:red">favorite</i>`;
            console.log("like");
        }
    }
    const likeNum = document.createElement("div");
    likeNum.className = "post-like-num";
    likeNum.setAttribute('data-toggle',"modal");
    likeNum.setAttribute('data-target',"#myModal");
    likeNum.onclick = function(){showLike(post.meta.likes)}; // if click like number, show like lists
    likeNum.style = "float:left; margin:12px; margin-left:0px";
    likeNum.innerText = `${post.meta.likes.length} likes`;
    const comments = document.createElement("div");//comment button
    comments.className = "post-commemts";
    comments.innerHTML = `<i class="material-icons">add_comment</i>`;
    comments.style = "float:left; margin:10px; margin-left:20px"; 
    const commNum = document.createElement("div");
    commNum.className = "post-comments-num";
    commNum.style = "float:left; margin:12px; margin-left:0px";
    commNum.innerText = `${post.comments.length} comments`;
    contentBottom.appendChild(comments);
    contentBottom.appendChild(commNum);
    contentBottom.appendChild(like);
    contentBottom.appendChild(likeNum);
    contentBottom.style = "overflow:hidden";
    section.appendChild(contentBottom);

    const commBox = document.createElement("div");// show posts comments
    var list = "";
    if (post.comments.length == 0){
        commBox.innerHTML = 
        `<ul class="list-group">
            <li class="list-group-item"style="margin-bottom:20px"><b>${post.meta.author}</b> ${post.meta.description_text}</li>
        </ul>`;
    }else{
        for(var i=0; i<post.comments.length; i++){
            const commTime = new Date(post.comments[i].published*1000).toLocaleString();
            const li = `<li class="list"><b>${post.comments[i].author}</b> ${post.comments[i].comment}\n<h6>${commTime}</h6></li>`;
            list += li;
            list += `<hr style="width:92%" />`;
        };
        commBox.innerHTML = 
        `<ul class="list-group ">
            <li class="list-group-item" style="margin-bottom:20px"><b>${post.meta.author}</b> ${post.meta.description_text}</li>${list}
        </ul>`;
    }
    section.appendChild(commBox);

    const addcomm = document.createElement("div");// add comment input
    addcomm.innerHTML =
    `<div class="input-group">
        <input type="text" class="form-control" placeholder="Add a comment...">
        <span class="input-group-btn">
            <button class="btn btn-default" type="button">Comment!</button>
        </span>
    </div>`;
    
    section.appendChild(addcomm);
    
    return section;
}

// user like a post
function addLike(id){
    let url = `http://127.0.0.1:5000/post/like?id=${id}`;
    fetch(url,{
        method:'PUT',
        headers:{
            'Authorization': "Token " + window.localStorage.TOKEN,
            "Content-Type":"application/json"
        }
    })
    .then(res=>{
        if(res.status === 403) {
            alert("Invalid Auth Token");
            getId("login").style.display="block";
            getId("mainpage").style.display="none";
            throw 0
        }
        if(res.status === 200) {
            getId(id).innerHTML = `<i class="material-icons" style="color:red">favorite</i>`;
            freshLike(id);
        }
    })
    .catch(err=>{
        console.log(err)
    })
}

function unLike(id){
    let url = `http://127.0.0.1:5000/post/unlike?id=${id}`;
    fetch(url,{
        method:'PUT',
        headers:{
            'Authorization': "Token " + window.localStorage.TOKEN,
            "Content-Type":"application/json"
        }
    })
    .then(res=>{
        if(res.status === 403) {
            alert("Invalid Auth Token");
            getId("login").style.display="block";
            getId("mainpage").style.display="none";
            throw 0
        }
        if(res.status === 200) {
            getId(id).innerHTML = `<i class="material-icons" style="color:red">favorite_border</i>`;
            freshLike(id);
        }
    })
    .catch(err=>{
        console.log(err)
    })
}

// update like lists in modal
function showLike(like_list){
    getId("like-list").innerHTML = '';
    console.log(like_list);
    if (like_list == ''){
        getId("like-list").innerHTML = '';
    }else{
        getId("like-list").innerHTML = '';
        for(var i =0; i< like_list.length; i++){
            let url = `http://127.0.0.1:5000/user/?id=${like_list[i]}`
            fetch(url,{
                method:'GET',
                headers:{
                    'Authorization': "Token " + window.localStorage.TOKEN,
                    "Content-Type":"application/json"
                }
            })
            .then(res=>{
                if(res.status === 403) {
                    alert("Invalid Auth Token");
                    getId("login").style.display="block";
                    getId("mainpage").style.display="none";
                    throw 0
                }
                if(res.status === 200) {
                    return res.json()
                }
            })
            .then(json=>{
                const likeLi = 
                `<li userId="${json.id}" class="list-group-item">
                    ${json.name}
                    <button type="button" class="btn btn-default btn-xs" style="float:right">Follow</button>
                </li>`;
                console.log(likeLi);
                getId("like-list").innerHTML += likeLi;
            })
            .catch(err=>{
                console.log(err)
            })
        }
    }
    
    
}


// ----------------------------------main-----------------------------------
//Interaction

getId("toRegister").addEventListener("click",function(){
    getId("login").style.display="none";
    getId("register").style.display="block";
});

getId("toLogin").addEventListener("click",function(){
    getId("register").style.display="none";
    console.log("ok");
    getId("login").style.display="block";
});

//check localstore token and logout
if (window.localStorage.TOKEN){
    getId("mainpage").style.display="block";
    getFeedData(0,3);
}else{
    getId("login").style.display="block";
}
console.log(window.localStorage.TOKEN);

getId("logout-button").addEventListener("click",function(){
    localStorage.clear();
    getId("large-feed").innerHTML='';
    getId("mainpage").style.display="none";
    getId("login").style.display="block";
});

getId("profile-button").addEventListener("click",function(){
    getId("large-feed").style.display="none";
    profileGetUsrByName(window.localStorage.myUsername);
    getId("container").style.display="block";
});

getId("banner-title").addEventListener("click",function(){
    getId("large-feed").style.display="block";
    getId("container").style.display="none";
});
getId("back").addEventListener("click",function(){
    getId("large-feed").style.display="block";
    getId("container").style.display="none";
});

// ----------------------------------implement function---------------------------
//Login
getId("loginSubmit").addEventListener("click",function(){
    let url = 'http://127.0.0.1:5000/auth/login'
    let data = {
        username: getId("usernameInput").value,
        password: getId("passwordInput").value
    }
    fetch(url,{
        method:'POST',
        body:JSON.stringify(data),
        headers:{
            "Content-Type":"application/json"
        }
    })
    .then(res=>{
        if(res.status === 400 || res.status === 403) {
            getId("invalidLogin").style.display="block";
            throw 0
        }
        return res.json()
    })
    .then(resp=>{
        console.log(resp.token)
        window.localStorage.myUsername = data.username;
        window.localStorage.TOKEN = resp.token;
        // console.log(window.localStorage.TOKEN);
        // console.log(window.localStorage.getItem('TOKEN'));
        getId("login").style.display="none";
        getId("mainpage").style.display="block";
        getUsrId(window.localStorage.myUsername);
        getFeedData(0,3);
        console.log("log ok");
        console.log( window.localStorage.myUsername);
    })
    .catch(err=>{
        console.log(err)
    })
});

//Sign up
getId("registerSubmit").addEventListener("click",function(){
    let url = 'http://127.0.0.1:5000/auth/signup'
    let data = {
        username: getId("registerUsernameInput").value,
        password: getId("registerPasswordInput").value,
        email: getId("registerEmailInput").value,
        name: getId("registerNameInput").value
    }
    fetch(url,{
        method:'POST',
        body:JSON.stringify(data),
        headers:{
            "Content-Type":"application/json"
        }
    })
    .then(res=>{
        if(res.status === 409) {
        getId("usernameTaken").style.display="block";
        getId("paraMiss").style.display="none";
        throw 0
        }
        if(res.status === 400) {
        getId("usernameTaken").style.display="none";
        getId("paraMiss").style.display="block";
        throw 0
        }
        return res.json()
    })
    .then(resp=>{
        console.log(resp.token)

        window.LocalStorage.myUsername = data.username;
        window.localStorage.TOKEN = resp.token;
        getId("register").style.display="none";
        getId("mainpage").style.display="block";
        getUsrId(window.localStorage.myUsername);
        getFeedData(0,3);
        console.log("submit ok");
    })
    .catch(err=>{
        console.log(err)
    })
});

//profile
//get user info
let userInfo = new Object();
function getUsrById(id){
    let url = `http://127.0.0.1:5000/user/?id=${id}`;
    fetch(url,{
        method:'GET',
        headers:{
            'Authorization': "Token " + window.localStorage.TOKEN,
            "Content-Type":"application/json"
        }
    })
    .then(res=>{
        if(res.status === 403) {
            alert("Invalid Auth Token");
            getId("login").style.display="block";
            getId("mainpage").style.display="none";
            throw 0
        }
        if(res.status === 200) {
            return res.json()
        }
    })
    .then(json=>{
        window.LocalStorage.id=json.id;
        userInfo.username=json.username;
        userInfo.name=json.name;
        userInfo.email=json.email;
        userInfo.posts=json.posts;
        userInfo.following=json.following;
        userInfo.followed_num=json.followed_num;
        console.log(userInfo);
        return userInfo;
    })
    .catch(err=>{
        console.log(err)
    })
};

function profileGetUsrByName(name){
    let url = `http://127.0.0.1:5000/user/?username=${name}`;
    fetch(url,{
        method:'GET',
        headers:{
            'Authorization': "Token " + window.localStorage.TOKEN,
            "Content-Type":"application/json"
        }
    })
    .then(res=>{
        if(res.status === 403) {
            alert("Invalid Auth Token");
            getId("login").style.display="block";
            getId("mainpage").style.display="none";
            throw 0
        }
        if(res.status === 200) {
            return res.json()
        }
    })
    .then(json=>{
        getId("pro-id").innerText = `Username: ${json.id}`;
        getId("username").innerText = `Name: ${json.username}`;
        getId("email").innerText = `Email: ${json.email}`;
        getId("name").innerText = `Name: ${json.name}`;
        getId("pro-post").innerText = `Posts: ${json.posts.length}`;
        getId("fllwing").innerText = `Following: ${json.following.length}`;
        getId("fllwed").innerText = `Followed: ${json.followed_num}`;

        getId("post-lists").innerHTML ="";
        for(var i=0;i<json.posts.length;i++){
            profilePost(json.posts[i])
        }
    })
    .catch(err=>{
        console.log(err)
    })
}

function profilePost(id){
    let url = `http://127.0.0.1:5000/post/?id=${id}`;
    fetch(url,{
        method:'GET',
        headers:{
            'Authorization': "Token " + window.localStorage.TOKEN,
            "Content-Type":"application/json"
        }
    })
    .then(res=>{
        if(res.status === 403) {
            alert("Invalid Auth Token");
            getId("login").style.display="block";
            getId("mainpage").style.display="none";
            throw 0
        }
        if(res.status === 200) {
            return res.json()
        }
    })
    .then(json=>{
        
        const pic = `<img class="post-thumb" src="data:image/png;base64,${json.thumbnail}" alt="${json.meta.description_text}">`;
        const dcrp = `<h5>${json.meta.description_text}</h5>`;
        const mix = `<li>${pic}${dcrp}<li><hr>`;
        getId("post-lists").innerHTML += mix ; 
    })
    .catch(err=>{
        console.log(err)
    })
}

// infinate scroll
console.log(document.body.offsetHeight);
console.log(document.body.clientHeight);
console.log(window.innerHeight);
console.log(window.scrollTop);
console.log(document.body.scrollTop);
console.log(document.body.scrollHeight);

var num = 3;
var stop=true;
window.onscroll=function(){
    let totalheight = parseFloat($(window).height()) + parseFloat($(window).scrollTop());
    if($(document).height() <= totalheight+100){
        if(stop==true){
            stop=false;
            getFeedData(num,3);
            num += 3;
            stop=true;
        }
    }
};



