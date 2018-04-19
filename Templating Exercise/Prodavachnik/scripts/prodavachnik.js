function startApp() {
    const baseUrl = 'https://baas.kinvey.com/';
    const appKey = 'kid_SJH0FsWvZ';
    const appSecret = 'ed5e681c67214ba2a0585580acd601e6';
    let days = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
    let months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    let years = [];
    for (let i = 1970; i <= 2017; i++) {
        years.push(`${i}`);
    }
    let homeView = $('#viewHome');

    $('#linkHome').show().click(showHome);
    let listAdsLink = $('#linkListAds').click(showAds);
    let createAdLink = $('#linkCreateAd').click(showCreateAd);
    let logoutLink = $('#linkLogout').click(executeLogout);
    let loginLink = $('#linkLogin').click(executeLogin);
    let registerLink = $('#linkRegister').click(executeRegister);

    let allSections = $('.show-hide');
    let loading = $('#loadingBox');
    let info = $('#infoBox');
    let errorBox = $('#errorBox');
    let loggedInUser = $('#loggedInUser');

    $('#buttonCreateAd').click(function () {
        createAd();
    });

    checkSession();

    function checkSession() {
        if (sessionStorage.getItem('authToken')) {
            allSections.hide();
            loggedInUser.show().text(`Welcome, ${sessionStorage.getItem('username')}`);
            homeView.show();
            listAdsLink.show();
            createAdLink.show();
            logoutLink.show();
            loginLink.hide();
            registerLink.hide();

        } else {
            allSections.hide();
            homeView.show();
            listAdsLink.hide();
            createAdLink.hide();
            logoutLink.hide();
            loginLink.show();
            registerLink.show();
        }
    };

    function showHome() {
        allSections.hide();
        homeView.show();
    }

    function showAds() {
        $('.show-hide').hide();
        loading.show();
        $.ajax({
            method: 'GET',
            url: baseUrl + 'appdata/' + appKey + '/ads',
            headers: {'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')},
            success: loadAds,
            error: handleError
        });
    }

    function loadAds(response) {
        /*let adsContainer = $('#ads');
         adsContainer.empty();
         if (ads.length == 0) {
         loading.hide();
         adsContainer.text('No advertisement available.');
         } else {
         let th = $('<th>Title</th><th>Publisher</th><th>Description</th><th>Price</th><th>Date Published</th><th>Actions</th>');
         let adsTable = $('<table>').append($('<tr>').append(th));

         for (let ad of ads) {
         let tdActions = $('<td>');

         if (ad._acl.creator == sessionStorage.getItem('userId')) {
         let deleteLink = $('<a href="#">[Delete] </a>').click(function () {
         deleteAd(ad)
         });
         let editLink = $('<a href="#">[Edit]</a>').click(function () {
         showEditAd(ad)
         });
         tdActions.append(deleteLink);
         tdActions.append(editLink);
         }
         adsTable.append($('<tr>').append(
         $('<td>').text(ad.Title),
         $('<td>').text(ad.Publisher),
         $('<td>').text(ad.Description),
         $('<td>').text(parseFloat(ad.Price).toFixed(2)),
         $('<td>').text(ad.DatePublished)
         ).append(tdActions));
         }
         adsContainer.append(adsTable);
         }*/
        function getAd() {
            return $.get('./templates/ad.html');
        }

        function getAds() {
            return $.get('./templates/ads.html');
        }

        $.when(getAd(), getAds()).done(function (adSource, adsSource) {
            Handlebars.registerPartial('ad', adSource[0]);
            response = response.map(function (x) {
                if (x._acl.creator == sessionStorage.getItem('userId')) {
                    x.isAuthor = true;
                }
                return x;
            });
            let template = Handlebars.compile(adsSource[0]);
            let context = {
                ads: response
            };
            $('main').append(template(context));
            $('#dltBtn').click(function () {
                let tr = $(this).parent().parent();
                let id = tr.attr('data-id');
                tr.remove();
                deleteAd(id);
            });
            $('#edtBtn').click(function () {

            });
            $('#viewAds').show();
            loading.hide();
            info.show().text('Advertisements loaded.').fadeOut(2000);
        });

    }

    function deleteAd(id) {
        loading.show();
        $.ajax({
            method: 'DELETE',
            url: baseUrl + 'appdata/' + appKey + '/ads/' + id,
            headers: {'Authorization': "Kinvey " + sessionStorage.getItem('authToken')},
            success: deleteAdSuccess,
            error: handleError
        });
        function deleteAdSuccess(response) {
            loading.hide();
            showInfo('Advertisement deleted!');
            setTimeout(function () {
                showAds();
            }, 1000);
        }
    }

    function showEditAd(ad) {
        allSections.hide();
        $('#viewEditAd').show();
        $('#formEditAd input[name="title"]').val(ad.Title);
        $('#formEditAd textarea').val(ad.Description);
        $('#formEditAd input[name="datePublished"]').val(ad.DatePublished);
        $('#formEditAd input[name="price"]').val(ad.Price);
        $('#buttonEditAd').on('click', function (event) {
            editAd(event.target, ad);
        });
    }

    function editAd(target, ad) {
        let formattedDate = checkDate($('#formEditAd input[name="datePublished"]').val());
        if (checkFields('formEditAd') && formattedDate) {
            errorBox.hide();
            let adData = {
                Publisher: sessionStorage.getItem('username'),
                Title: $('#formEditAd input[name="title"]').val(),
                Description: $('#formEditAd textarea').val(),
                DatePublished: formattedDate,
                Price: $('#formEditAd input[name="price"]').val()
            };
            $.ajax({
                method: 'PUT',
                url: baseUrl + 'appdata/' + appKey + '/ads/' + ad._id,
                headers: {'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')},
                data: adData,
                success: editAdSuccess,
                error: handleError
            });

            function editAdSuccess(response) {
                $(target).off();
                showInfo('Advertisement edited successfully.');
                setTimeout(function () {
                    showAds();
                });
            }
        }
    }

    function showCreateAd() {
        allSections.hide();
        $('.viewCreateAd').show();
    }

    function createAd() {
        let createForm = $('#formCreateAd');
        let titleInput = createForm.find('input[name=title]');
        let descriptionInput = createForm.find('textarea[name=description]');
        let datePublishedInput = createForm.find('input[name=datePublished]');
        let priceInput = createForm.find('input[name=price]');

        let formattedDate = checkDate(datePublishedInput.val());
        if (checkFields('formCreateAd') && formattedDate) {
            errorBox.hide();
            loading.show();
            let adData = {
                Title: titleInput.val(),
                Description: descriptionInput.val(),
                DatePublished: formattedDate,
                Price: priceInput.val(),
                Publisher: sessionStorage.getItem('username')
            };
            $.ajax({
                method: 'POST',
                url: baseUrl + 'appdata/' + appKey + '/ads',
                headers: {'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')},
                data: adData,
                success: createAdSuccess,
                error: handleError
            });
            function createAdSuccess(ad) {
                showAds();
                showInfo('Advertisement created.');
            }

            titleInput.val('');
            descriptionInput.val('');
            datePublishedInput.val('');
            priceInput.val('');
        }
    }

    function executeLogout() {
        sessionStorage.clear();
        loggedInUser.text('');
        checkSession();
        showInfo('Logout successful.')
        info.fadeOut(3000);
    }

    function executeLogin() {
        allSections.hide();
        $('#viewLogin').show();
        let username = $('#formLogin input[name=username]');
        let password = $('#formLogin input[name=passwd]');
        username.val('');
        password.val('');
        $('#buttonLoginUser').click(() => {
            loading.show();
            let userData = {
                username: username.val(),
                password: password.val()
            }
            $.ajax({
                method: 'POST',
                url: baseUrl + 'user/' + appKey + '/login',
                headers: {'Authorization': 'Basic ' + btoa(appKey + ':' + appSecret)},
                data: userData,
                success: loginSuccess,
                error: handleError
            })
        });
        function loginSuccess(userInfo) {
            saveAuthInSession(userInfo);
            checkSession();
            loading.hide();
            showInfo(`Login successful.`);
            info.fadeOut(3000);
        }

    }

    function executeRegister() {
        allSections.hide();
        $('#viewRegister').show();
        let username = $('#formRegister input[name=username]');
        let password = $('#formRegister input[name=passwd]');
        username.val('');
        password.val('');
        $('#buttonRegisterUser').click(() => {
            loading.show();
            let userData = {};
            if (username.val().length < 1) {
                loading.hide();
                errorBox.show().text('Error: Username should be at least one symbol');
                return;
            } else {
                userData.username = username.val();
                userData.password = password.val();
            }

            $.ajax({
                method: 'POST',
                url: baseUrl + 'user/' + appKey + '/',
                headers: {
                    'Authorization': 'Basic ' + btoa(appKey + ':' + appSecret)
                },
                data: userData,
                success: registerSuccess,
                error: handleError
            })
        });

        function registerSuccess(userInfo) {
            saveAuthInSession(userInfo);
            checkSession();
            loading.hide();
            showInfo(`User ${userInfo.username} successfully registered.`);
        }
    }

    function saveAuthInSession(userInfo) {
        let userAuth = userInfo._kmd.authtoken;
        sessionStorage.setItem('authToken', userAuth);
        let userId = userInfo._id;
        sessionStorage.setItem('userId', userId);
        sessionStorage.setItem('username', userInfo.username);
    }

    function handleError(response) {
        loading.hide();
        let errorMsg = JSON.stringify(response);
        if (response.readyState === 0) {
            errorMsg = "Cannot connect due to network error.";
        }
        if (response.responseJSON && response.responseJSON.description) {
            errorMsg = response.responseJSON.description;
        }
        errorBox.show().text(`Error: ${errorMsg}`);
    }

    function showInfo(message) {
        info.show().text(message);
    }

    function checkDate(date) {
        let dateTokens = '';
        if (date.includes('-')) {
            dateTokens = date.split('-');
            if (dateTokens.length < 3) {
                errorBox.show().text('Error! Invalid date format!');
                return false;
            } else {
                if (!days.includes(dateTokens[2])) {
                    errorBox.show().text('Error! Invalid date format!');
                    return false;
                }
                if (!months.includes(dateTokens[1])) {
                    errorBox.show().text('Error! Invalid date format!');
                    return false;
                }
                if (!years.includes(dateTokens[0])) {
                    errorBox.show().text('Error! Invalid date format!');
                    return false;
                }
            }
            return `${dateTokens[1]}/${dateTokens[2]}/${dateTokens[0]}`
        } else {
            dateTokens = date.split('/')
            if (dateTokens.length < 3 || dateTokens.length > 3) {
                errorBox.show().text('Error! Invalid date format!');
                return false;
            } else {
                if (!days.includes(dateTokens[1])) {
                    errorBox.show().text('Error! Invalid date format!');
                    return false;
                }
                if (!months.includes(dateTokens[0])) {
                    errorBox.show().text('Error! Invalid date format!');
                    return false;
                }
                if (!years.includes(dateTokens[2])) {
                    errorBox.show().text('Error! Invalid date format!');
                    return false;
                }
            }
            return `${dateTokens[0]}/${dateTokens[1]}/${dateTokens[2]}`;
        }
    }

    function checkFields(form) {
        let title = $(`#${form} input[name="title"]`).val();
        let description = $(`#${form} textarea`).val();
        let datePublished = $(`#${form} input[name="datePublished"]`).val();
        let price = $(`#${form} input[name="price"]`).val();

        if (!title || !description || !datePublished || !price) {
            errorBox.show().text('All fields required!');
            return false;
        } else {
            return true;
        }
    }
}