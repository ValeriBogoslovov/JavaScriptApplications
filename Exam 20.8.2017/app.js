let errorBox = $('#errorBox').hide();
let infoBox = $('#infoBox').hide();
let loading = $('#loadingBox').hide();

$(() => {
    let headerLogo = $('.logo');
    let headerProfile = $('#profile');
    let allContentElements = $('div.content>div, div.content>section');
    let footer = $('footer');
    let menuLinks = $('#menu .nav');

    let viewWelcome = $('#viewWelcome');
    let viewCatalog = $('#viewCatalog');
    let viewSubmit = $('#viewSubmit');
    let viewMyPosts = $('#viewMyPosts');
    let viewEdit = $('#viewEdit');
    let viewComments = $('#viewComments');
    let viewMenu = $('#menu');

    let usernameRegex = /^[a-zA-Z]{3,}$/g;
    let passwordRegex = /^[a-zA-Z0-9]{6,}$/;

    checkSession();
    attachEvents();

    function checkSession() {
        if (!sessionStorage.getItem('authtoken')) {
            headerProfile.hide();
            allContentElements.hide();
            headerLogo.show();
            viewWelcome.show();
        }else{
            viewWelcome.hide();
            $('#profile>span').text(sessionStorage.getItem('username'));
            headerProfile.show();
            viewMenu.show();
            forumService.showCatalog();
        }
    }

    function attachEvents() {
        $('#registerForm input[value="Sign Up"]').click(registerUser);
        $('#loginForm input[value="Sign In"]').click(loginUser);
        let catalogLink = menuLinks[0];
        let submitLink = menuLinks[1];
        let myPosts = menuLinks[2];
        $(myPosts).click(forumService.showMyPosts);
        $(submitLink).click(forumService.showCreatePost);
        $(catalogLink).click(forumService.showCatalog);
        $('#submitForm #btnSubmitPost').click(forumService.createPost);
        $('header a').click(logoutUser);
    }
    
    function registerUser(event) {
        loading.show();
        event.preventDefault();

        let username = $('#registerForm input[name="username"]').val();
        let password = $('#registerForm input[name="password"]').val();
        let repeatPassword = $('#registerForm input[name="repeatPass"]').val();
        let usernameRegex = /^[a-zA-Z]{3,}$/g;
        let passwordRegex = /^[a-zA-Z0-9]{6,}$/;

        if(!usernameRegex.test(username)){
            auth.showError('Username must be at least 3 characters long and contain only english letters!');
            return;
        }else if(!passwordRegex.test(password)){
            auth.showError('Password must be at least 6 characters long and contain letters and digits!');
            return;
        }else if(password !== repeatPassword){
            auth.showError("Passwords don't match!");
            return;
        }else{
            auth.register(username,password)
                .then(function (userInfo) {
                    auth.saveSession(userInfo);
                    auth.showInfo('User registration successful.');
                    clearFields();
                    checkSession();
                }).catch(auth.handleError)
        }
    }

    function loginUser(event) {
        loading.show();
        event.preventDefault();
        let username = $('#loginForm input[name="username"]').val();
        let password = $('#loginForm input[name="password"]').val();
        let usernameRegex = /^[a-zA-Z]{3,}$/g;
        let passwordRegex = /^[a-zA-Z0-9]{6,}$/;

        auth.login(username, password)
            .then(function (userInfo) {
                auth.saveSession(userInfo);
                auth.showInfo('Login successful!');
                clearFields();
                checkSession();
                forumService.showCatalog();
            }).catch(auth.handleError);

    }

    function logoutUser() {
        loading.show();
        auth.logout()
            .then(function () {
                auth.showInfo('Logout successful.');
                sessionStorage.clear();
                checkSession();
            }).catch(auth.handleError)
    }

    function clearFields() {
        $('input').not('[type=submit]').val('');
    }

});