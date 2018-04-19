function attachEvents() {
    $('#btnLoadTowns').click(function () {
        let source = $('#towns-template').html();
        let template = Handlebars.compile(source);

        let towns = $('#towns').val().split(', ').map(function (x) {
            return {town: x};
        });

        let context = {towns};
        let html = template(context);
        $('#root').html(html);
    });
}