document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modalIdentidade');
    const areaEscrita = document.getElementById('areaEscrita');
    const lista = document.getElementById('listaComentarios');

    let dadosTemporarios = {};

    // 1. Abrir Modal
    document.getElementById('btnNovoComentario').onclick = () => {
        modal.style.display = 'flex';
    };

    // 2. Fechar Modal
    document.getElementById('fecharModal').onclick = () => {
        modal.style.display = 'none';
    };

    // 3. Validação e Confirmação
    document.getElementById('btnConfirmar').onclick = () => {
        const nome = document.getElementById('nomeUser').value.trim();
        const email = document.getElementById('emailUser').value.trim();
        const assunto = document.getElementById('assuntoUser').value;

        if (nome === "" || !email.includes("@")) {
            alert("Por favor, preencha nome e e-mail corretamente.");
            return;
        }

        dadosTemporarios = { nome, assunto };

        // Esconder modal e mostrar área de escrita
        modal.style.display = 'none';
        areaEscrita.style.display = 'block';
        document.getElementById('identificacaoAviso').innerText = `Postando como: ${nome} em "${assunto}"`;
        document.getElementById('textoComentario').focus();
    };

    // 4. Enviar e Proteção XSS
    document.getElementById('btnEnviar').onclick = () => {
        const texto = document.getElementById('textoComentario').value.trim();

        if (texto === "") {
            alert("O comentário não pode estar vazio.");
            return;
        }

        // Criar elemento de comentário
        const comentarioDiv = document.createElement('div');
        comentarioDiv.className = 'module-card';
        comentarioDiv.style.borderLeft = "5px solid var(--secondary-color)";
        comentarioDiv.setAttribute('data-assunto', dadosTemporarios.assunto);

        // SEGURANÇA: textContent para que NENHUM código HTML/JS seja executado
        const header = document.createElement('h4');
        header.textContent = `${dadosTemporarios.nome} - ${dadosTemporarios.assunto}`;

        const body = document.createElement('p');
        body.textContent = texto;

        comentarioDiv.appendChild(header);
        comentarioDiv.appendChild(body);

        // Adiciona no topo da lista
        lista.prepend(comentarioDiv);

        // Resetar área
        areaEscrita.style.display = 'none';
        document.getElementById('textoComentario').value = "";
        alert("Comentário enviado com sucesso!");
    };

    // 5. Filtro
    document.getElementById('filtroAssunto').onchange = (e) => {
        const selecionado = e.target.value;
        const itens = lista.querySelectorAll('.module-card');

        itens.forEach(item => {
            if (selecionado === "todos" || item.getAttribute('data-assunto') === selecionado) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        });
    };
    // Função para pegar data e hora atual formatada
    function obterDataHora() {
        const agora = new Date();
        return agora.toLocaleDateString('pt-BR') + ' às ' +
            agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    // Função Principal de Criar Comentário
    window.criarElementoComentario = function (nome, assunto, texto, ehResposta = false, containerPai = null) {
        const div = document.createElement('div');
        div.className = ehResposta ? 'resposta-container' : 'module-card';
        if (!ehResposta) div.setAttribute('data-assunto', assunto);

        // Data e Hora
        const spanData = document.createElement('span');
        spanData.className = 'comentario-data';
        spanData.textContent = obterDataHora();

        // Cabeçalho (Nome e Assunto)
        const h4 = document.createElement('h4');
        h4.textContent = ehResposta ? nome : `${nome} - Assunto: ${assunto}`;

        // Texto do Comentário (Seguro contra XSS)
        const p = document.createElement('p');
        p.textContent = texto;

        div.appendChild(spanData);
        div.appendChild(h4);
        div.appendChild(p);

        // Se não for uma resposta, adiciona o botão "Responder"
        if (!ehResposta) {
            const btnResp = document.createElement('button');
            btnResp.className = 'btn-responder';
            btnResp.innerHTML = '<i class="fas fa-reply"></i> Responder';
            btnResp.onclick = () => abrirAreaResposta(div, nome);
            div.appendChild(btnResp);

            // Container para as futuras respostas deste comentário
            const containerRespostas = document.createElement('div');
            containerRespostas.className = 'lista-respostas';
            div.appendChild(containerRespostas);

            document.getElementById('listaComentarios').prepend(div);
        } else {
            containerPai.appendChild(div);
        }
    };

    // Função para abrir o campo de resposta
    function abrirAreaResposta(comentarioDiv, nomeOriginal) {
        // Remove áreas de resposta abertas anteriormente para não poluir
        const antiga = document.querySelector('.area-resposta-ativa');
        if (antiga) antiga.remove();

        const area = document.createElement('div');
        area.className = 'area-resposta-ativa';
        area.style.marginTop = "15px";

        const txt = document.createElement('textarea');
        txt.placeholder = `Respondendo para ${nomeOriginal}...`;
        txt.style.width = "100%";
        txt.style.padding = "10px";

        const btnEnvi = document.createElement('button');
        btnEnvi.textContent = "Enviar Resposta";
        btnEnvi.className = "btn btn-secondary";
        btnEnvi.style.marginTop = "5px";

        btnEnvi.onclick = () => {
            if (txt.value.trim() === "") return alert("Digite algo!");

            // Aqui usamos o nome de quem está logado (armazenado quando preencheu o modal)
            const nomeLogado = document.getElementById('nomeUser').value || "Visitante";

            criarElementoComentario(nomeLogado, null, txt.value, true, comentarioDiv.querySelector('.lista-respostas'));
            area.remove();
        };

        area.appendChild(txt);
        area.appendChild(btnEnvi);
        comentarioDiv.appendChild(area);
    }

    // Ajuste no botão Enviar principal para usar a nova função
    document.getElementById('btnEnviar').onclick = () => {
        const texto = document.getElementById('textoComentario').value.trim();
        const assunto = document.getElementById('assuntoUser').value;
        const nome = document.getElementById('nomeUser').value;

        if (texto === "") {
            alert("O comentário não pode estar vazio!");
            return;
        }

        criarElementoComentario(nome, assunto, texto);

        document.getElementById('textoComentario').value = "";
        document.getElementById('areaEscrita').style.display = 'none';
    };
});
