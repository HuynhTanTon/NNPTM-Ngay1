
async function LoadData() {
    try {
        let res = await fetch("http://localhost:3000/posts")
        if (!res.ok) {
            console.error("Lỗi khi tải posts:", res.status);
            document.getElementById("body_table").innerHTML = '<tr><td colspan="4">Không thể tải dữ liệu. Vui lòng kiểm tra json-server đã chạy chưa.</td></tr>';
            return;
        }
        let posts = await res.json();
        let body = document.getElementById("body_table");
        body.innerHTML = '';
        if (posts.length === 0) {
            body.innerHTML = '<tr><td colspan="4">Chưa có dữ liệu</td></tr>';
            return;
        }
        for (const post of posts) {
            // Thêm style gạch ngang nếu post đã bị xóa mềm
            let style = post.isDeleted ? 'style="text-decoration: line-through; opacity: 0.6;"' : '';
            body.innerHTML += `<tr ${style}>
                <td>${post.id}</td>
                <td>${post.title}</td>
                <td>${post.views}</td>
               <td><input type="submit" value="Delete" onclick="Delete('${post.id}')"/></td>
            </tr>`
        }
    } catch (error) {
        console.error("Lỗi khi tải posts:", error);
        document.getElementById("body_table").innerHTML = '<tr><td colspan="4">Lỗi kết nối. Vui lòng kiểm tra json-server đã chạy chưa (npx json-server db.json).</td></tr>';
    }
}
async function Save() {
    let id = document.getElementById("id_txt").value;
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("view_txt").value;
    
    // Nếu ID trống, tạo mới với ID tự động
    if (!id || id.trim() === '') {
        // Lấy tất cả posts để tìm maxId
        let allPostsRes = await fetch('http://localhost:3000/posts');
        let allPosts = await allPostsRes.json();
        let maxId = 0;
        for (const post of allPosts) {
            let numId = parseInt(post.id);
            if (!isNaN(numId) && numId > maxId) {
                maxId = numId;
            }
        }
        id = String(maxId + 1);
        
        // Tạo mới post
        try {
            let res = await fetch('http://localhost:3000/posts', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: id,
                    title: title,
                    views: views,
                    isDeleted: false
                })
            });
            if (res.ok) {
                console.log("Tạo mới thành công");
                // Xóa form
                document.getElementById("id_txt").value = '';
                document.getElementById("title_txt").value = '';
                document.getElementById("view_txt").value = '';
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        // Cập nhật post hiện có
        let getItem = await fetch('http://localhost:3000/posts/' + id)
        if (getItem.ok) {
            let currentPost = await getItem.json();
            let res = await fetch('http://localhost:3000/posts/'+id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...currentPost,
                    title: title,
                    views: views,
                    isDeleted: false
                })
            });
            if (res.ok) {
                console.log("Cập nhật thành công");
                // Xóa form
                document.getElementById("id_txt").value = '';
                document.getElementById("title_txt").value = '';
                document.getElementById("view_txt").value = '';
            }
        }
    }
    LoadData();
    return false;
}
async function Delete(id) {
    // Lấy thông tin post hiện tại
    let getItem = await fetch('http://localhost:3000/posts/' + id);
    if (getItem.ok) {
        let currentPost = await getItem.json();
        // Cập nhật post với isDeleted: true (xóa mềm)
        let res = await fetch("http://localhost:3000/posts/" + id, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...currentPost,
                isDeleted: true
            })
        });
        if (res.ok) {
            console.log("Xóa mềm thành công");
        }
    }
    LoadData();
    return false;
}

// ========== COMMENTS CRUD ==========
async function LoadComments() {
    try {
        let res = await fetch("http://localhost:3000/comments")
        if (!res.ok) {
            console.error("Lỗi khi tải comments:", res.status);
            document.getElementById("body_comments_table").innerHTML = '<tr><td colspan="4">Không thể tải dữ liệu. Vui lòng kiểm tra json-server đã chạy chưa.</td></tr>';
            return;
        }
        let comments = await res.json();
        let body = document.getElementById("body_comments_table");
        body.innerHTML = '';
        if (comments.length === 0) {
            body.innerHTML = '<tr><td colspan="4">Chưa có dữ liệu</td></tr>';
            return;
        }
        for (const comment of comments) {
            // Thêm style gạch ngang nếu comment đã bị xóa mềm
            let style = comment.isDeleted ? 'style="text-decoration: line-through; opacity: 0.6;"' : '';
            body.innerHTML += `<tr ${style}>
                <td>${comment.id}</td>
                <td>${comment.text}</td>
                <td>${comment.postId}</td>
               <td><input type="submit" value="Delete" onclick="DeleteComment('${comment.id}')"/></td>
            </tr>`
        }
    } catch (error) {
        console.error("Lỗi khi tải comments:", error);
        document.getElementById("body_comments_table").innerHTML = '<tr><td colspan="4">Lỗi kết nối. Vui lòng kiểm tra json-server đã chạy chưa (npx json-server db.json).</td></tr>';
    }
}

async function SaveComment() {
    let id = document.getElementById("comment_id_txt").value;
    let text = document.getElementById("comment_text_txt").value;
    let postId = document.getElementById("comment_postId_txt").value;
    
    // Nếu ID trống, tạo mới với ID tự động
    if (!id || id.trim() === '') {
        // Lấy tất cả comments để tìm maxId
        let allCommentsRes = await fetch('http://localhost:3000/comments');
        let allComments = await allCommentsRes.json();
        let maxId = 0;
        for (const comment of allComments) {
            let numId = parseInt(comment.id);
            if (!isNaN(numId) && numId > maxId) {
                maxId = numId;
            }
        }
        id = String(maxId + 1);
        
        // Tạo mới comment
        try {
            let res = await fetch('http://localhost:3000/comments', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: id,
                    text: text,
                    postId: postId,
                    isDeleted: false
                })
            });
            if (res.ok) {
                console.log("Tạo comment thành công");
                // Xóa form
                document.getElementById("comment_id_txt").value = '';
                document.getElementById("comment_text_txt").value = '';
                document.getElementById("comment_postId_txt").value = '';
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        // Cập nhật comment hiện có
        let getItem = await fetch('http://localhost:3000/comments/' + id)
        if (getItem.ok) {
            let currentComment = await getItem.json();
            let res = await fetch('http://localhost:3000/comments/'+id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...currentComment,
                    text: text,
                    postId: postId,
                    isDeleted: false
                })
            });
            if (res.ok) {
                console.log("Cập nhật comment thành công");
                // Xóa form
                document.getElementById("comment_id_txt").value = '';
                document.getElementById("comment_text_txt").value = '';
                document.getElementById("comment_postId_txt").value = '';
            }
        }
    }
    LoadComments();
    return false;
}

async function DeleteComment(id) {
    // Lấy thông tin comment hiện tại
    let getItem = await fetch('http://localhost:3000/comments/' + id);
    if (getItem.ok) {
        let currentComment = await getItem.json();
        // Cập nhật comment với isDeleted: true (xóa mềm)
        let res = await fetch("http://localhost:3000/comments/" + id, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...currentComment,
                isDeleted: true
            })
        });
        if (res.ok) {
            console.log("Xóa mềm comment thành công");
        }
    }
    LoadComments();
    return false;
}

// Load dữ liệu khi trang được tải
LoadData();
LoadComments();
