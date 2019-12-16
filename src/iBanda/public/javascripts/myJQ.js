$(document).ready(function() {
    $('#registo_button').click(function(event) {
        event.preventDefault();

        var username = $('#registo_username').val();

        var pattern = /^([a-z0-9][\.\_\-]?)+@[a-zA-Z]+?\.[a-zA-Z]{2,3}/;

        if (pattern.test(username) && !username.includes('@iBanda.com')) {
            // Fazer pedido ajax.
            $.ajax({
                url: '/registo',
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                data: $('#registo_form').serialize(),
                success: function(data, textStatus, jQxhr) {
                    alert('Registo efetuado!');
                    window.location = '/';
                },
                error: function(jqXhr, textStatus, errorThrown) {
                    alert('Erro no registo...');
                }
            });
        } else {
            alert('Dados inválidos! Tente novamente...');
        }
    });

    $('#login_button').click(function(event) {
        event.preventDefault();

        var username = $('#login_username').val();

        var pattern = /^([a-z0-9][\.\_\-]?)+@[a-zA-Z]+?\.[a-zA-Z]{2,3}/;

        if (pattern.test(username)) {
            // Fazer pedido ajax.
            $.ajax({
                url: '/login/processaLogin',
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                data: $('#login_form').serialize(),
                success: function(data, textStatus, jQxhr) {
                    alert('Login efetuado com sucesso!');
                    window.location = '/';
                },
                error: function(jqXhr, textStatus, errorThrown) {
                    alert('Erro ao efetuar o login. Username ou Password inválidos!');
                }
            });
        } else {
            alert('Dados inválidos! Tente novamente...');
        }
    });

    $('#upload_obra').click(function(event) {
        event.preventDefault();

        // Fazer pedido ajax.
        $.ajax({
            url: '/login/verificaLogin',
            type: 'GET',
            contentType: 'application/x-www-form-urlencoded',
            success: function(data, textStatus, jQxhr) {
                window.location = '/ingest';
            },
            error: function(jqXhr, textStatus, errorThrown) {
                alert('Não tem sessão iniciada!');
            }
        });
    });
});
