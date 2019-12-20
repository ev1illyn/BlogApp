const express = require("express");
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express();
//template engine
const path = require('path')
const admin = require('./routes/admin')
const usuario = require('./routes/usuario')
const mongoose = require("mongoose")
const session = require("express-session")
const flash = require("connect-flash")
require('./models/Postagem')
const Postagem =  mongoose.model("postagens")
require('./models/Categoria')
const Categoria = mongoose.model("categorias")
require('./models/Usuario')
const Usuario = mongoose.model("usuarios")
const passport = require("passport")
require("./config/auth")(passport)

//Configurações

    //Sessão
    app.use(session({
        secret: "nodejs",
        resave: true,
        saveUninitialized: true
    }))

    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())

    //Middleware
    app.use((req, res, next) => {
        //variaveis globais
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null
        next()
    })

    //Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    
    //Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars');

    //Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect("mongodb://localhost/blogapp").then(() => {
        console.log("Conectado ao mongo!")
    }).catch((err) => {
        console.log("Erro ao se conectar: " + err )
    })

    //Public
        app.use(express.static(path.join(__dirname, "public")))

//Rotas
    app.get('/', (req, res) => {
        Postagem.find().populate("categoria").sort({date: 'desc'}).then((postagens) => {
            res.render("admin/index", {postagens: postagens})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno!")
            res.render("/404")
        })
    })

    app.get('/postagem/:slug', (req, res) => {
        Postagem.findOne({slug: req.params.slug}).populate("categoria").then((postagem) => {
            if(postagem) {
                res.render('postagem/index', {postagem: postagem})
            } else {
                req.flash("error_msg", "Houve um erro ao exibir: " + req.params.slug + "!")
                res.redirect('admin/index')
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao exibir listagem!")
            res.redirect("/")
        })
    })

    app.get('/categorias', (req, res) => {
        Categoria.find().then((categorias) => {
            res.render('categorias/index', {categorias: categorias})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao listar categorias!")
            res.redirect("/")
        })
    })

    app.get('/categorias/:slug', (req, res) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {
            if(categoria) {
                Postagem.find({categoria: categoria._id}).populate("categoria").then((postagens) => {
                    res.render('categorias/postagens', {postagens: postagens})
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao exibir as postagens dessa categoria!")
                    res.redirect('admin/index')
                })
            } else {
                req.flash("error_msg", "Houve um erro ao exibir: " + req.params.slug + "!")
                res.redirect('admin/index')
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao exibir listagem!")
            res.redirect("/")
        })
    })

    app.get("/404", (req, res) => {
        res.send("Erro 404!")
    })

    app.use('/admin', admin)
    app.use('/usuarios', usuario)

//Outros
const PORT = 8089
app.listen(PORT, () => {
    console.log("Servidor rodando na url http://localhost:8089");
});