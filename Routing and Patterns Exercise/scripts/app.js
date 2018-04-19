$(() => {
    const app = Sammy('#main', function () {
        this.use('Handlebars', 'hbs');
        this.get('#/home', displayHome);
        this.get('#/about', displayAbout);
        this.get('#/login', displayLogin);
        this.post('#/login', loginUser);
        this.get('#/register', displayRegister);
        this.post('#/register', registerUser);
        this.get('#/logout', logoutUser);
        this.get('#/catalog', displayCatalog);
        this.get('#/create', displayCreateTeam);
        this.post('#/create', createTeam);
        this.get('#/join/:id', joinTeam);
        this.get('#/leave', leaveTeam);
        this.get('#/edit/:id', displayEditTeam);
        this.post('#/edit/:id', editTeam);
        this.get('#/catalog/:id', displayTeamDetails);

        this.get('', displayHome);


        function displayAbout(ctx) {
            ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
            ctx.username = sessionStorage.getItem('username');
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/about/about.hbs');
            });
        }

        function displayHome(ctx) {
            ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
            ctx.username = sessionStorage.getItem('username');
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/home/home.hbs');
            });
        }

        function displayLogin(ctx) {
            ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
            ctx.username = sessionStorage.getItem('username');
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                loginForm: './templates/login/loginForm.hbs'
            }).then(function () {
                this.partial('./templates/login/loginPage.hbs');
            });
        }

        function loginUser(ctx) {
            let username = ctx.params.username;
            let password = ctx.params.password;

            auth.login(username, password)
                .then(function (userInfo) {
                    auth.saveSession(userInfo);
                    auth.showInfo('Successfully logged in!');
                    displayHome(ctx);
                }).catch(auth.handleError);

        }

        function displayRegister(ctx) {
            ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
            ctx.username = sessionStorage.getItem('username');
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                registerForm: './templates/register/registerForm.hbs'
            }).then(function () {
                this.partial('./templates/register/registerPage.hbs');
            });
        }

        function registerUser(ctx) {
            let username = ctx.params.username;
            let password = ctx.params.password;
            let repeatPassword = ctx.params.repeatPassword;
            if (password !== repeatPassword) {
                auth.showError('PASSWORDS DO NOT MATCH!');
            } else {
                auth.register(username, password, repeatPassword)
                    .then(function (userInfo) {
                        auth.saveSession(userInfo);
                        auth.showInfo('User Registered!');
                        displayHome(ctx);
                    }).catch(auth.handleError);
            }
            ;
        }

        function logoutUser(ctx) {
            auth.logout()
                .then(function () {
                    sessionStorage.clear();
                    auth.showInfo('Logged out!');
                    displayHome(ctx);
                }).catch(auth.handleError);
        }

        function displayCatalog(ctx) {
            ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
            ctx.username = sessionStorage.getItem('username');
            teamsService.loadTeams()
                .then(function (teams) {
                    ctx.hasNoTeam = sessionStorage.getItem('teamId') === null
                        || sessionStorage.getItem('teamId') === 'undefined';
                    ctx.teams = teams;
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        team: './templates/catalog/team.hbs'
                    }).then(function () {
                        this.partial('./templates/catalog/teamCatalog.hbs')
                    })
                })
        }

        function displayCreateTeam(ctx) {
            ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
            ctx.username = sessionStorage.getItem('username');
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                createForm: './templates/create/createForm.hbs'
            }).then(function () {
                this.partial('./templates/create/createPage.hbs');
            })
        }

        function createTeam(ctx) {
            let teamName = ctx.params.name;
            let teamComment = ctx.params.comment;

            teamsService.createTeam(teamName, teamComment)
                .then(function (teamInfo) {
                    teamsService.joinTeam(teamInfo._id)
                        .then(function (userInfo) {
                            auth.saveSession(userInfo);
                            auth.showInfo(`Team ${teamName} successfully created!`);
                            displayCatalog(ctx);
                        }).catch(auth.handleError);
                }).catch(auth.handleError);
        }

        function displayTeamDetails(ctx) {
            let teamId = ctx.params.id.substr(1);
            teamsService.loadTeamDetails(teamId)
                .then(function (teamInfo) {
                    ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
                    ctx.username = sessionStorage.getItem('username');
                    ctx.teamId = teamId;
                    ctx.name = teamInfo.name;
                    ctx.comment = teamInfo.comment;
                    ctx.isOnTeam = teamInfo._id === sessionStorage.getItem('teamId');
                    ctx.isAuthor = teamInfo._acl.creator === sessionStorage.getItem('userId');
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        teamControls: './templates/catalog/teamControls.hbs'
                    }).then(function () {
                        this.partial('./templates/catalog/details.hbs')
                    });
                }).catch(auth.handleError);
        }

        function joinTeam(ctx){
            let teamId = ctx.params.id.substr(1);

            teamsService.joinTeam(teamId)
                .then(function (userInfo) {
                    auth.saveSession(userInfo);
                    auth.showInfo('Successfully joined team!');
                    displayCatalog(ctx);
                }).catch(auth.handleError);
        }

        function leaveTeam(ctx) {
            teamsService.leaveTeam()
                .then(function (userInfo) {
                    auth.saveSession(userInfo);
                    auth.showInfo('Successfully leaved team!');
                    displayCatalog(ctx);
                }).catch(auth.handleError)
        }

        function displayEditTeam(ctx) {
            let teamId = ctx.params.id.substr(1);

            teamsService.loadTeamDetails(teamId)
                .then(function (teamInfo) {
                    ctx.teamId = teamId;
                    ctx.name = teamInfo.name;
                    ctx.comment = teamInfo.comment;
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        editForm: './templates/edit/editForm.hbs'
                    }).then(function () {
                        this.partial('./templates/edit/editPage.hbs')
                    }).catch(auth.handleError)
                }).catch(auth.handleError)
        }

        function editTeam(ctx) {
            let teamId = ctx.params.id.substr(1);
            let teamName = ctx.params.name;
            let teamComment = ctx.params.comment;

            teamsService.edit(teamId, teamName, teamComment)
                .then(function () {
                    auth.showInfo(`Team ${teamName} successfully edited!`);
                    displayCatalog(ctx);
                }).catch(auth.handleError)
        }

    });

    app.run();
});