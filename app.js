var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mysql = require('mysql2/promise');
var app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "Claudio"
});

// Armazenamento em memória para os clientes

// Rota principal que exibe a lista de clientes
app.get('/', async function(req, res) {
    const [data] = await db.query("SELECT * FROM pessoa WHERE id = 1");
    var pessoa = {
    nome: data[0].nome,
    github: data[0].github,
    linkedin: data[0].linkedin,
    telefone: data[0].telefone,
    email: data[0].email,
    endereco: data[0].endereco,
    descricao: data[0].descricao,
    foto: data[0].foto
    }
    var [formacao] = await db.query("SELECT * FROM formacao WHERE id = "+data[0].id);
    var [cursos] = await db.query("SELECT * FROM cursos WHERE id = "+data[0].id);
    var [projetos] = await db.query("SELECT * FROM projetos WHERE id = "+data[0].id);
    var [competencias] = await db.query("SELECT * FROM competencias WHERE id = "+data[0].id);
    var [links] = await db.query("SELECT * FROM links WHERE id = "+data[0].id);
    res.render('index', { formacao: formacao, cursos: cursos, projetos: projetos, competencias: competencias, pessoa: pessoa, links: links });
});

// Rota que recebe os dados do novo cliente e o adiciona à lista
app.post('/adicionar', async function(req, res) {
    const opcao = req.body.opcao;
    const pessoaId = 1;

    if (opcao === "pessoa") {

        await db.query(`
            UPDATE pessoa SET 
            nome = ?, github = ?, linkedin = ?,
            telefone = ?, email = ?, endereco = ?, 
            descricao = ?, foto = ?
            WHERE id = ?
        `, [
            req.body.pessoa.nome,
            req.body.pessoa.github,
            req.body.pessoa.linkedin,
            req.body.pessoa.telefone,
            req.body.pessoa.email,
            req.body.pessoa.endereco,
            req.body.pessoa.descricao,
            req.body.pessoa.foto,
            pessoaId
        ]);

    } else if (opcao === "formacao") {

        await db.query(`
            INSERT INTO formacao (pessoa_id, texto, nome, nivel, instituicao, ano)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            pessoaId,
            req.body.formacao.texto,
            req.body.formacao.nome,
            req.body.formacao.nivel,
            req.body.formacao.instituicao,
            req.body.formacao.ano
        ]);

    } else if (opcao === "curso") {

        await db.query(`
            INSERT INTO cursos (pessoa_id, texto, nome, instituicao, ano)
            VALUES (?, ?, ?, ?, ?)
        `, [
            pessoaId,
            req.body.curso.texto,
            req.body.curso.nome,
            req.body.curso.instituicao,
            req.body.curso.ano
        ]);

    } else if (opcao === "projeto") {

        await db.query(`
            INSERT INTO projetos (pessoa_id, texto, nome, descricao)
            VALUES (?, ?, ?, ?)
        `, [
            pessoaId,
            req.body.projeto.texto,
            req.body.projeto.nome,
            req.body.projeto.descricao
        ]);

    } else if (opcao === "competencia") {

        await db.query(`
            INSERT INTO competencias (pessoa_id, competencia)
            VALUES (?, ?)
        `, [
            pessoaId,
            req.body.competencia.nome
        ]);

    } else if (opcao === "link") {

        await db.query(`
            INSERT INTO links (pessoa_id, url, nome)
            VALUES (?, ?, ?)
        `, [
            pessoaId,
            req.body.link.url,
            req.body.link.nome
        ]);
    }

    res.redirect('/');
});

// Rota que exclui um cliente da lista
app.delete('/excluir', async function (req, res) {
    var opcao = req.body.opcao;
    var id = req.body.id
    if (opcao === "formacao") {
        await db.query("DELETE FROM formacao WHERE id = ?", [id]);
    } else if (opcao === "curso") {
        await db.query("DELETE FROM cursos WHERE id = ?", [id]);
    } else if (opcao === "projeto") {
        await db.query("DELETE FROM projetos WHERE id = ?", [id]);
    } else if (opcao === "competencia") {
        await db.query("DELETE FROM competencias WHERE id = ?", [id]);
    } else if (opcao === "link") {
        await db.query("DELETE FROM links WHERE id = ?", [id]);
    }
    res.redirect('/');
});

app.listen(3000, function() {
    console.log("Servidor rodando na porta 3000");
});