$(() => {
    let allMainElements = $('main section');

    let loading = $('#loadingBox').hide();
    let info = $('#infoBox').hide();
    let error = $('#errorBox').hide();


    let viewAppHome = $('#viewAppHome');
    let viewLogin = $('#viewLogin');
    let viewRegister = $('#viewRegister');
    let viewUserHome = $('#viewUserHome');
    let viewMyMessages = $('#viewMyMessages');
    let viewArchiveSent = $('#viewArchiveSent');
    let viewSendMessages = $('#viewSendMessage');

    let anonymous = $('.anonymous');
    let useronly = $('.useronly');
    let welcomeUser = $('#spanMenuLoggedInUser');
    let welcomeHeading = $('#viewUserHomeHeading');

    checkSession();
    attachEvents();

    function checkSession() {
        let username = sessionStorage.getItem('username');
        let name = sessionStorage.getItem('name');
        if (!sessionStorage.getItem('authtoken')) {
            allMainElements.hide();
            useronly.hide();
            anonymous.show();
            viewAppHome.show();
        } else {
            allMainElements.hide();
            anonymous.hide();
            useronly.show();

            welcomeUser.text(`Welcome, ${username}`);
            viewUserHome.show();
            welcomeHeading.text(`Welcome, ${name}`);
        }
    }

    function attachEvents() {
        //Display views
        $('#linkMenuRegister').click(displayRegister);
        $('#linkMenuLogin').click(displayLogin);
        $('#linkMenuAppHome').click(displayAppHome);
        $('#linkMenuUserHome').click(displayUserHome);
        $('.my-messages').click(displayUserMessages);
        $('.archive').click(displayArchive);
        $('.send-message').click(displaySendMessage);


        //Make Actions
        $('#linkMenuLogout').click(userLogout);
        $('#formRegister input[type="submit"]').click(registerUser);
        $('#formLogin input[type="submit"]').click(loginUser);
        $('#formSendMessage input[type="submit"]').click(sendMessage);
    }

    function displayRegister() {
        allMainElements.hide();
        viewRegister.show();
        $('#registerName').val('');
        $('#registerUsername').val('');
        $('#registerPasswd').val('');
    }

    function registerUser(event) {
        loading.show();
        event.preventDefault();
        let username = $('#registerUsername').val();
        let password = $('#registerPasswd').val();
        let name = $('#registerName').val();
        if (!username || !password || !name) {
            loading.hide();
            auth.showError('All fields required!');
            return;
        } else {
            auth.register(username, password, name)
                .then(function (userInfo) {
                    auth.saveSession(userInfo);
                    loading.hide();
                    auth.showInfo(`User ${username} successfully registered`);
                    checkSession();
                }).catch(function (reason) {
                loading.hide();
                auth.handleError(reason);
            })
        }
    }

    function displayLogin() {
        allMainElements.hide();
        viewLogin.show();
        $('#loginUsername').val('');
        $('#loginPasswd').val('');
    }

    function loginUser(event) {
        event.preventDefault();
        loading.show();
        let username = $('#loginUsername').val();
        let password = $('#loginPasswd').val();
        if (!username || !password) {
            loading.hide();
            auth.showError('All fields required');
            return;
        } else {
            auth.login(username, password)
                .then(function (userInfo) {
                    auth.saveSession(userInfo);
                    loading.hide();
                    auth.showInfo(`${userInfo.username} successfully logged in!`);
                    checkSession();
                }).catch(function (reason) {
                loading.hide();
                auth.handleError(reason);
            })
        }
    }

    function displayAppHome() {
        allMainElements.hide();
        viewAppHome.show();
    }

    function displayUserHome() {
        allMainElements.hide();
        viewUserHome.show();
    }

    function displayUserMessages() {
        allMainElements.hide();
        loading.show();
        let tbody = $('#myMessages table tbody');
        $.ajax({
            method: 'GET',
            url: `https://baas.kinvey.com/appdata/kid_ByHCkVxOb/messages?query={"recipient_username":"${sessionStorage.getItem('username')}"}`,
            headers: {'Authorization': 'Kinvey ' + sessionStorage.getItem('authtoken')},
            success: getMessages,
            error: auth.handleError
        });

        function getMessages(response) {
            for (let msg of response) {
                let date = formatDate(msg['_kmd']['lmt'])
                tbody.append($(`<tr><td>${msg['sender_name']} (${msg['sender_username']})</td><td>${msg['text']}</td><td>${date}</td></tr>`))
            }
            loading.hide();
            auth.showInfo('All messages loaded');
            viewMyMessages.show();
        }
    }

    function displayArchive() {
        allMainElements.hide();
        loading.show();
        let tbody = $('#sentMessages table tbody');
        tbody.empty();
        $.ajax({
            method: 'GET',
            url: `https://baas.kinvey.com/appdata/kid_ByHCkVxOb/messages?query={"sender_username":"${sessionStorage.getItem('username')}"}`,
            headers: {'Authorization': 'Kinvey ' + sessionStorage.getItem('authtoken')},
            success: getArchiveSuccess,
            error: auth.handleError
        });
        function getArchiveSuccess(response) {
            for (let msg of response) {
                let date = formatDate(msg['_kmd']['lmt']);
                let tr = $('<tr>');
                let username = $('<td>').text(msg['recipient_username']);
                let text = $('<td>').text(msg['text']);
                let postedOn = $('<td>').text(date);
                let btnTD = $('<td>');
                let deleteBtn = $('<button>').text('Delete').click(function () {
                    deleteMessage(msg['_id']);
                    tr.remove();
                    auth.showInfo('Message successfully deleted!');
                });
                btnTD.append(deleteBtn);
                tr.append(username, text, postedOn, btnTD);
                tbody.append(tr);
            }
        }

        loading.hide();
        viewArchiveSent.show();
    }

    function deleteMessage(id) {
        $.ajax({
            method: 'DELETE',
            url: `https://baas.kinvey.com/appdata/kid_ByHCkVxOb/messages/${id}`,
            headers: {'Authorization': 'Kinvey ' + sessionStorage.getItem('authtoken')},
            success: viewArchiveSent,
            error: auth.handleError
        });
    }

    function displaySendMessage() {
        allMainElements.hide();
        loading.show();
        $.ajax({
            method: 'GET',
            url: `https://baas.kinvey.com/user/kid_ByHCkVxOb`,
            headers: {'Authorization': 'Kinvey ' + sessionStorage.getItem('authtoken')},
            success: getUsers,
            error: auth.handleError
        });
        function getUsers(response) {
            let select = $('#msgRecipientUsername');
            for (let user of response) {
                select.append($(`<option value="${user['username']}">${user['name']} (${user['username']})</option>`));
            }
            loading.hide();
            viewSendMessages.show();
        }

    }

    function sendMessage(event) {
        loading.show();
        event.preventDefault();
        let username = $('#msgRecipientUsername').val();

        let appData = {
            sender_username: sessionStorage.getItem('username'),
            sender_name: sessionStorage.getItem('name'),
            recipient_username: username,
            text: $('#msgText').val()
        };

        $.ajax({
            method: 'POST',
            url: `https://baas.kinvey.com/appdata/kid_ByHCkVxOb/messages`,
            headers: {'Authorization': 'Kinvey ' + sessionStorage.getItem('authtoken')},
            data: appData,
            success: sendMessageSuccess,
            error: auth.handleError
        });
        function sendMessageSuccess(response) {
            $('#msgText').val('');
            loading.hide();
            auth.showInfo(`Message to ${response['recipient_username']} successfully sended!`);
        }
    }

    function userLogout() {
        auth.logout()
            .then(function () {
                sessionStorage.clear();
                auth.showInfo('Successfully logged out!');
                checkSession();
            }).catch(auth.handleError);

    }

    function formatDate(dateISO8601) {
        let date = new Date(dateISO8601);
        if (Number.isNaN(date.getDate()))
            return '';
        return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
            "." + date.getFullYear() + ' ' + date.getHours() + ':' +
            padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

        function padZeros(num) {
            return ('0' + num).slice(-2);
        }
    }

});