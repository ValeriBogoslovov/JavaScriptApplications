let allMainElements = $('main section');
let viewAppHome = $('#viewAppHome');
let viewUserHome = $('#viewUserHome');
let viewUserHomeHeading = $('#viewUserHomeHeading');
let viewShop = $('#viewShop');
let viewCart = $('#viewCart');
let loggedInSpan = $('#spanMenuLoggedInUser');
let loading = $('#loadingBox').hide();
let info = $('#infoBox').hide();
let error = $('#errorBox').hide();
let anonymousLinks = $('.anonymous');
let userOnlyLinks = $('.useronly');
$(() =>{
    checkSession();
    attachEvents();
    function checkSession() {
        if(!sessionStorage.getItem('authtoken')){
            allMainElements.hide();
            userOnlyLinks.hide();
            anonymousLinks.show();
            viewAppHome.show();
        }else {
            allMainElements.hide();
            anonymousLinks.hide();
            loggedInSpan.text(`Welcome, ${sessionStorage.getItem('username')}!`)
            userOnlyLinks.show();
            viewUserHomeHeading.text(`Welcome, ${sessionStorage.getItem('name')}!`);
            viewUserHome.show();
        }
    }
    function attachEvents() {
        $('#linkMenuAppHome').click(()=> {allMainElements.hide(); viewAppHome.show();});
        $('#linkMenuRegister').click(()=>{allMainElements.hide();$('#viewRegister').show();});
        $('#formRegister input[value="Register"]').click(registerUser);
        $('#linkMenuLogin').click(()=>{allMainElements.hide();$('#viewLogin').show();});
        $('#formLogin input[value="Login"]').click(loginUser);
        $('#linkMenuUserHome').click(()=>{allMainElements.hide();$('#viewUserHome').show()});
        $('.shop').click(marketService.showShop);
        $('.cart').click(marketService.showCart);
        $('#linkMenuLogout').click(logoutUser);
    }

    function registerUser(event) {
        loading.show();
        event.preventDefault();
        let username = $('#registerUsername');
        let password = $('#registerPasswd');
        let name = $('#registerName');

        if(!username.val() || !password.val() || !name.val()){
            auth.showError('All fields required!');
            return;
        }else{
            auth.register(username.val(), password.val(), name.val())
                .then(function (userInfo) {
                    auth.saveSession(userInfo);
                    auth.showInfo(`User ${userInfo.name} successfully registered!`);
                    clearFields();
                    checkSession();
                }).catch(auth.handleError);
        }
    }
    function loginUser(event) {
        loading.show();
        event.preventDefault();
        let username = $('#loginUsername');
        let password = $('#loginPasswd');
        if(!username.val() || !password.val()){
            auth.showError('All fields required!');
            return;
        }else {
            auth.login(username.val(), password.val())
                .then(function (userInfo) {
                    auth.saveSession(userInfo);
                    auth.showInfo('Login successful!');
                    clearFields();
                    checkSession();
                }).catch(auth.handleError);
            username.val('');
            password.val('');
        }
    }
    function logoutUser() {
        auth.logout()
            .then(function () {
                auth.showInfo('Successfully logged out!');
                sessionStorage.clear();
                checkSession();
            }).catch(auth.handleError)
    }
    function clearFields() {
        $('input').not('[type=submit]').val('');
    }
    return{
        checkSession
    };
});