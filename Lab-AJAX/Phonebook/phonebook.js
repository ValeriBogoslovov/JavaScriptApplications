$(function () {
        $('#btnLoad').click(loadContacts);
        $('#btnCreate').click(createContact);
        let baseUrl = 'https://phonebook-bb1dd.firebaseio.com/';

        function loadContacts() {
            let request = {url: baseUrl + '.json', success: displayContacts};

            $.ajax(request);

            function displayContacts(contacts){
                let phoneBook = $('#phonebook');
                phoneBook.empty();
                for (let key in contacts) {
                    let liElement = $('<li>');
                    let btnDelete = $('<button>');
                    btnDelete.text('Delete').click(function () {
                       let deleteRequest = {url: baseUrl + key + '.json', method: 'DELETE'};
                       liElement.remove();
                       $.ajax(deleteRequest);
                    });
                    liElement.text(`${contacts[key]['person']}: ${contacts[key]['phone']}`).append(btnDelete);
                    $('#phonebook').append(liElement);
                }
            }
        }

        function createContact() {
            let personData = $('#person').val();
            let phoneData = $('#phone').val();
            let contact = {person: personData, phone: phoneData};
            let request = {url: baseUrl + '.json', method:'POST', data: JSON.stringify(contact)}
            $('#person').val('');
            $('#phone').val('');
            $.ajax(request);

        }

});