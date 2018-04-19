let forumService = (()=>{

    function showCatalog() {
        $('div.content>section').hide();
        loading.show();
        requester.get('appdata', 'posts?query={}&sort={"_kmd.ect": -1}')
            .then(function (response) {
                let divPosts = $('#viewCatalog .posts');
                divPosts.empty();
                if(response.length === 0){
                    divPosts.text('No posts in database.');
                }
                let counter = 0;
                for (let post of response) {
                    let timeAgo = calcTime(post._kmd.ect);
                    let article = $('<article>').addClass('post');
                    article.append($('<div>').addClass('col rank').append($('<span>').text(++counter)));
                    article.append($('<div>').addClass('col thumbnail').append($(`<a href="${post.url}">`).append($(`<img src="${post.imageUrl}">`))))
                    let postContent = $('<div>').addClass('post-content');
                    postContent.append($('<div>').addClass('title').append($(`<a href="${post.url}">`).text(post.title)));
                    let details = $('<div>').addClass('details');
                    let infoDiv = $('<div>').addClass('info').text(`submitted ${timeAgo} ago by ${post.author}`);
                    details.append(infoDiv);
                    let ulLink = $('<ul>');
                    let commentsLink = $('<li class="action">').append($('<a href="#" class="commentsLink">').text('comments')).click(function () {
                        showComments(post._id);
                    });
                    let editLink = $('<li class="action">').append($('<a href="#" class="editLink">').text('edit')).click(function () {
                        showEditPost(post);
                    });
                    let deleteLink = $('<li class="action">').append($('<a href="#" class="deleteLink">').text('delete')).click(function () {
                        deletePost(post._id);
                        article.remove();
                    });
                    ulLink.append(commentsLink);

                    if(post.author === sessionStorage.getItem('username')) {
                        ulLink.append(editLink);
                        ulLink.append(deleteLink);
                    }
                    details.append(ulLink);
                    postContent.append(details)
                    article.append(postContent);
                    divPosts.append(article)
                }
                loading.hide();
                $('#viewCatalog').show();
            }).catch(auth.handleError)
    }

    function showComments(postId) {
        loading.show();
        $('div.content>section').hide();
        requester.get('appdata', `posts/${postId}`)
            .then(function (response) {
                let timeAgo = calcTime(response._kmd.ect);
                let viewComments = $('#viewComments');
                viewComments.empty();
                let divPost = $('<div class="post">');

                let editLink = $('<li class="action">').append($('<a href="#" class="editLink">').text('edit'));
                let deleteLink = $('<li class="action">').append($('<a href="#" class="deleteLink">').text('delete'));
                let ulLink = $('<ul>');
                let details = $('<div>').addClass('details');
                let divControls = $('<div class="controls">');
                if(response.author === sessionStorage.getItem('username')) {
                    ulLink.append(editLink);
                    ulLink.append(deleteLink);
                    divControls.append(ulLink);
                }

                let thumbnail = $('<div class="col thumbnail">').append($(`<a href="${response.url}">`).append($(`<img src="${response.imageUrl}">`)));
                divPost.append(thumbnail);
                let divPostContent = $('<div class="post-content">').append($('<div class="title">').append($(`<a href="${response.url}">`).text(response.title)));
                details.append($(`<p>${response.description}</p>`));
                details.append($(`<div class="info">`).text(`submitted ${timeAgo} ago by ${response.author}`));
                details.append(divControls)
                divPostContent.append(details);
                divPost.append(divPostContent);

                viewComments.append(divPost);
                viewComments.append($('<div class="clear">'));

                let divCommentArea = $('<div class="post post-content">');
                divCommentArea.append($('<form id=commentForm>').append($('<label>Comment</label>')).append($('<textarea name="content" type="text">'))
                    .append($('<input type="submit" value="Add Comment" id="btnPostComment">')));
                viewComments.append(divCommentArea);
                requester.get('appdata', `comments/?query={"postId":"${postId}"}&sort={"${response._kmd.ect}":-1`,'Kinvey')
                    .then(function (comments) {
                        for (let comment of comments) {
                            let daysAgo = calcTime(comment._kmd.ect);
                            let articleComment = $('<article class="post post-content">');
                            articleComment.append($(`<p>${comment.content}</p>`))
                            let divInfo = $('<div class="info">');
                            divInfo.text(`submitted ${daysAgo} ago by ${comment.author}`)
                            if(comment.author === sessionStorage.getItem('username')){
                                divInfo.append($('<div href="#" class="deleteLink">').text('delete'));
                            }
                            articleComment.append(divInfo);
                            viewComments.append(articleComment);
                        }
                        auth.showInfo('Comments loaded.');
                        viewComments.show();
                    }).catch(auth.handleError)
            }).catch(auth.handleError)

    }

    function showCreatePost() {
        $('div.content>section').hide();
        $('#viewSubmit').show();
    }

    function createPost(event) {
        loading.show();
        event.preventDefault();
        let linkUrl = $('#submitForm input[name="url"]');
        let linkTitle = $('#submitForm input[name="title"]');
        let linkThumbnail = $('#submitForm input[name="image"]');
        let comment = $('#submitForm textarea');

        if(!linkUrl.val().startsWith('http')){
            auth.showError('Link URL should start with http!');
            return;
        }else if(!linkTitle.val()){
            auth.showError('Link Title is required!');
            return;
        }else{
            data = {
                author: sessionStorage.getItem('username'),
                title: linkTitle.val(),
                description: comment.val(),
                url: linkUrl.val(),
                imageUrl: linkThumbnail.val()
            };
            requester.post('appdata','posts','Kinvey', data)
                .then(function () {
                    auth.showInfo('Post created.');
                    linkTitle.val('');
                    linkUrl.val('');
                    linkThumbnail.val('');
                    comment.val('');
                    showCatalog();
                }).catch(auth.handleError)
        }
    }

    function showMyPosts() {
        loading.show();
        $('div.content>section').hide();
        let endPoint = 'https://baas.kinvey.com/appdata/app_id/posts?query={"author":"username"}&sort={"_kmd.ect": -1}'
        requester.get('appdata', `posts/?query={"author":"${sessionStorage.getItem('username')}"}&sort={"${sessionStorage.getItem('kmd')}": -1}`)
            .then(function (myPost) {
                let myPostSection = $('#viewMyPosts');
                myPostSection.empty();
                let divPostTitle = $(`<div class="post post-content">`).append($(`<h1>Your Posts</h1>`));
                myPostSection.append(divPostTitle);
                let divPosts = $('<div class="posts">');
                divPosts.empty();
                if(myPost.length === 0){
                    myPostSection.text('No posts in database.');
                }
                let counter = 0;
                for (let post of myPost) {
                    let timeAgo = calcTime(post._kmd.ect);
                    let article = $('<article>').addClass('post');
                    article.append($('<div>').addClass('col rank').append($('<span>').text(++counter)));
                    article.append($('<div>').addClass('col thumbnail').append($(`<a href="${post.url}">`).append($(`<img src="${post.imageUrl}">`))));
                    let postContent = $('<div>').addClass('post-content');
                    postContent.append($('<div>').addClass('title').append($(`<a href="${post.url}">`).text(post.title)));
                    let details = $('<div>').addClass('details');
                    let infoDiv = $('<div>').addClass('info').text(`submitted ${timeAgo} ago by ${post.author}`);
                    details.append(infoDiv);
                    let ulLink = $('<ul>');
                    let commentsLink = $('<li class="action">').append($('<a href="#" class="commentsLink">').text('comments')).click(function () {
                        showComments(post._id);
                    });
                    let editLink = $('<li class="action">').append($('<a href="#" class="editLink">').text('edit')).click(function () {
                        showEditPost(post)
                    });
                    let deleteLink = $('<li class="action">').append($('<a href="#" class="deleteLink">').text('delete')).click(function () {
                        deletePost(post._id);
                        article.remove();
                    });
                    ulLink.append(commentsLink);

                    ulLink.append(editLink);
                    ulLink.append(deleteLink);

                    details.append(ulLink);
                    postContent.append(details);
                    article.append(postContent);
                    divPosts.append(article);

                }
                myPostSection.append(divPosts);
                loading.hide();
                myPostSection.show();
            }).catch(auth.handleError)
    }

    function deletePost(postId) {
        requester.remove('appdata', `posts/${postId}`, 'Kinvey')
            .then(function () {
                auth.showInfo('Post deleted.');
            }).catch(auth.handleError)
    }

    function calcTime(dateIsoFormat) {
        let diff = new Date - (new Date(dateIsoFormat));
        diff = Math.floor(diff / 60000);
        if (diff < 1) return 'less than a minute';
        if (diff < 60) return diff + ' minute' + pluralize(diff);
        diff = Math.floor(diff / 60);
        if (diff < 24) return diff + ' hour' + pluralize(diff);
        diff = Math.floor(diff / 24);
        if (diff < 30) return diff + ' day' + pluralize(diff);
        diff = Math.floor(diff / 30);
        if (diff < 12) return diff + ' month' + pluralize(diff);
        diff = Math.floor(diff / 12);
        return diff + ' year' + pluralize(diff);
        function pluralize(value) {
            if (value !== 1) return 's';
            else return '';
        }
    }

    function showEditPost(post) {
        $('div.content>section').hide();
        let viewEdit = $('#viewEdit');
        $('#editPostForm input[name="url"]').val(post.url);
        $('#editPostForm input[name="title"]').val(post.title);
        $('#editPostForm input[name="image"]').val(post.imageUrl);
        $('#editPostForm textarea').val(post.description);
        viewEdit.show();
        $('#btnEditPost').click(function () {
            editPost(post);
        })
    }
    function editPost(post) {
        loading.show();
        let url = $('#editPostForm input[name="url"]')
        let title = $('#editPostForm input[name="title"]')
        let imageUrl = $('#editPostForm input[name="image"]')
        let description = $('#editPostForm textarea');

        let data = {
            author: sessionStorage.getItem('username'),
            title: title.val(),
            description:description.val(),
            url:url.val(),
            imageUrl:imageUrl.val()
        };

        requester.update('appdata', `posts/${post._id}`,'Kinvey',data)
            .then(function () {
                auth.showInfo('Post edited');
                url.val('');
                title.val('');
                imageUrl.val('');
                description.val('');
                showCatalog();

            }).catch(auth.handleError)
    }
    return{
        showCatalog,
        showCreatePost,
        showMyPosts,
        createPost
    }
})();