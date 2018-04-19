let marketService = (() => {
    const appId = 'kid_HkNLjuW_b';

    function showCart() {
        allMainElements.hide();
        loading.show();
        let tbody = $('#cartProducts tbody');
        tbody.empty();
        requester.get('user', sessionStorage.getItem('userId'))
            .then(function (user) {
                let products = user.cart;
                for (let product in products) {
                    let tr = $('<tr>');
                    let totalPrice = Number(products[product]['quantity']) * Number(products[product]['product']['price']);
                    tr.append($(`<td>${products[product]['product']['name']}</td>`), $(`<td>${products[product]['product']['description']}</td>`), $(`<td>${products[product]['quantity']}</td>`), $(`<td>${totalPrice.toFixed(2)}</td>`));
                    let btnTD = $('<td>');
                    let discardBtn = $('<button>').text('Discard').click((event)=>{
                        discardProduct(product);
                        $(event.target).parent().parent().remove();
                    });
                    btnTD.append(discardBtn);
                    tr.append(btnTD);
                    tbody.append(tr);
                }
                loading.hide();
                viewCart.show();
            })
            .catch(auth.handleError)
    }
    function discardProduct(id) {
        loading.show();
        requester.get('user', sessionStorage.getItem('userId'))
            .then(function (user) {
                delete user.cart[id];
                requester.update('user', sessionStorage.getItem('userId'),'Kinvey', user)
                    .then(function () {
                        auth.showInfo('Product successfully discarded!');
                    })
                    .catch(auth.handleError)
            })
            .catch(auth.handleError)
    }

    function showShop() {
        allMainElements.hide();
        loading.show();
        let url = `https://baas.kinvey.com/appdata/${appId}/products`;
        let authorization = {'Authorization': 'Kinvey ' + sessionStorage.getItem('authtoken')};
        requester.get('appdata', 'products')
            .then(function showShopSuccess(response) {
                let tbody = $('#shopProducts tbody');
                for (let product of response) {
                    let tr = $('<tr>');
                    tr.append($(`<td>${product['name']}</td>`), $(`<td>${product['description']}</td>`), $(`<td>${Number(product['price']).toFixed(2)}</td>`));
                    let btnTD = $('<td>');
                    let btnPurchase = $('<button>').text('Purchase').click(() => {
                        purchaseItem(product)
                    });
                    btnTD.append(btnPurchase);
                    tr.append(btnTD);
                    tbody.append(tr);
                }
                auth.showInfo('All products loaded!');
                viewShop.show();
            }).catch(auth.handleError)
    }

    function purchaseItem(product) {
        loading.show();
        requester.get('user', sessionStorage.getItem('userId'))
            .then(function (response) {
                if(!response.cart){
                    response.cart = {};
                }
                let keys = Object.keys(response.cart);
                if(keys.includes(product._id)){
                    response.cart[product._id].quantity++;
                }else{
                    response.cart[product._id] = {
                        quantity: 1,
                        product:{
                            name: product.name,
                            description: product.description,
                            price: product.price
                        }
                    }
                }
                requester.update('user', sessionStorage.getItem('userId'), 'Kinvey', response)
                    .then(function () {
                        auth.showInfo('Item successfully purchased!');
                    }).catch(auth.handleError)
            })
            .catch(auth.handleError)
    }

    return {
        showCart,
        showShop
    };
})()