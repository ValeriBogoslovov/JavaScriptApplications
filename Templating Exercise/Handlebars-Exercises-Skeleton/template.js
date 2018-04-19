$(() => {
    renderCatTemplate();

    function renderCatTemplate() {
        let source = $('#cat-template').html();
        let template = Handlebars.compile(source);

        let context = {cats: window.cats};
        let html = template(context);
        $('#allCats').html(html);

        $('.btn').click(function () {
            let div = $(this).parent().find($('div'));
            div.toggle();
            if(div.css('display') == 'none'){
                $(this).text('Show status code');
            }else{
                $(this).text('Hide status code');
            }

        })
    }

});
