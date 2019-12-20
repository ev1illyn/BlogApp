const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const { isAdmin } = require("../helpers/isAdmin")

router.get('/', isAdmin, (req, res) => {
    res.render("admin/index")
})

router.get('/categorias', isAdmin, (req, res) => {
    Categoria.find().sort({date: 'desc'}).then((categorias) => {
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err) => {
        res.flash("error_msg", "Houve um erro ao listar categorias!")
        res.redirect("/admin")
    })
})

router.post('/categorias/buscar', isAdmin, (req, res) => {
    Categoria.find({nome:new RegExp(req.body.nome, "i")}).sort({date: 'desc'}).then((categorias) => {
        if(categorias) {
            console.log("buscando..")
            console.log(categorias)
            res.render("admin/categorias", {categorias: categorias})
        } else { 
            res.flash("error_msg", "Houve um erro ao buscar")
        }
    }).catch((err) => {
        res.flash("error_msg", "Houve um erro ao buscar")
    })
})

router.get('/categorias/add', isAdmin, (req, res) => {
    res.render("admin/addCategoria")
})

router.post('/categorias/nova', isAdmin, (req, res) => {
    
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined
        || req.body.nome == null) {
            erros.push({texto: "Nome inválido"})
    }
    if(req.body.nome.length < 2) {
        erros.push({texto: "Nome de categoria muito pequeno!"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined
        || req.body.slug == null) {
            erros.push({texto: "Slug inválido"})
    }
    if(erros.length > 0) {
        res.render("admin/addCategoria", {erros: erros})
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar categoria!")
        })
    }  
})

router.get("/categorias/edit/:id", isAdmin, (req, res) => {
    Categoria.findOne({_id:req.params.id}).then((categoria) => {
        res.render("admin/editCategoria", {categoria: categoria})
    }).catch((err) => {
        req.flash("err_msg", "Esta categoria não existe!")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/edit", isAdmin, (req, res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria) => {
        
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao editar categoria!")
            res.redirect("/admin/categorias")
        })


    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a categoria!")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/delete", isAdmin, (req, res) => {

    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a categoria!")
        res.redirect("/admin/categorias")
    })
})

router.get('/postagens', isAdmin, (req, res) => {
    Postagem.find().populate("categoria").sort({date: 'desc'}).then((postagens) => {
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err) => {
        res.flash("error_msg", "Houve um erro ao listar postagens!")
        res.redirect("/admin")
    })
})

router.get('/postagens/add', isAdmin, (req, res) => {
    Categoria.find().sort({date: 'desc'}).then((categorias) => {
        res.render("admin/addPostagem", {categorias: categorias})
    }).catch((err) => {
        res.flash("error_msg", "Houve um erro ao carregar formulário!")
        res.redirect("/admin/postagens/add")
    })
})


router.post('/postagens/nova', isAdmin, (req, res) => {
    
    var erros = []

    if(!req.body.titulo || typeof req.body.titulo == undefined
        || req.body.titulo == null) {
            erros.push({texto: "Título inválido!"})
    }
    if(req.body.titulo.length < 2) {
        erros.push({texto: "Titulo de postagem muito pequeno!"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined
        || req.body.slug == null) {
            erros.push({texto: "Slug inválido!"})
    }
    if(!req.body.descricao || typeof req.body.descricao == undefined
        || req.body.descricao == null) {
            erros.push({texto: "Descrição inválida!"})
    }
    if(req.body.descricao.length < 5) {
        erros.push({texto: "Descrição de postagem muito pequena!"})
    }
    if(!req.body.conteudo || typeof req.body.conteudo == undefined
        || req.body.conteudo == null) {
            erros.push({texto: "Conteúdo inválido!"})
    }
    if(req.body.conteudo.length < 5) {
        erros.push({texto: "Conteúdo de postagem muito pequeno!"})
    }

    if(erros.length > 0) {
        res.render("admin/addPostagem", {erros: erros})
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar postagem!")
        })
    }  
})


router.get("/postagens/edit/:id", isAdmin, (req, res) => {
    Postagem.findOne({_id:req.params.id}).then((postagem) => {

        Categoria.find().sort({date: 'desc'}).then((categorias) => {
            res.render("admin/editPostagem", {postagem: postagem, categorias: categorias})
        }).catch((err) => {
            res.flash("error_msg", "Houve um erro ao carregar formulário!")
            res.redirect("/admin/postagens/add")
        })
    }).catch((err) => {
        req.flash("err_msg", "Erro ao editar postagem!")
        res.redirect("/admin/postagens")
    })
})

router.post("/postagens/edit", isAdmin, (req, res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => {
        
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao editar postagem!")
            res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a postagem!")
        res.redirect("/admin/postagens")
    })
})

router.post("/postagens/delete", isAdmin, (req, res) => {
    Postagem.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a postagem!")
        res.redirect("/admin/postagens")
    })
})

module.exports = router