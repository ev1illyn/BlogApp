const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcryptjs = require("bcryptjs")
const passport = require("passport")
const { isAdmin } = require("../helpers/isAdmin")

router.get('/registro', isAdmin, (req, res) => {
    res.render("usuarios/registro")
})

router.post('/registro', isAdmin, (req, res) => {

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined
        || req.body.nome == null) {
            erros.push({texto: "Nome inválido!"})
    }
    if(req.body.nome.length < 3) {
        erros.push({texto: "Nome muito pequeno!"})
    }
    if(!req.body.email || typeof req.body.email == undefined
        || req.body.email == null) {
            erros.push({texto: "Email inválido!"})
    }
    if(!req.body.senha || typeof req.body.senha == undefined
        || req.body.senha == null) {
            erros.push({texto: "Senha inválida!"})
    }
    if(req.body.senha.length < 3) {
        erros.push({texto: "Senha muito pequena!"})
    }
    if(!req.body.confirmaSenha || typeof req.body.confirmaSenha == undefined
        || req.body.confirmaSenha == null) {
            erros.push({texto: "Senha inválida!"})
    }
    if(req.body.confirmaSenha != req.body.senha) {
        erros.push({texto: "As senhas não são iguais!"})
    }

    if(erros.length > 0) {
        res.render("usuarios/registro", {erros: erros})
    } else {
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if (usuario) {
                req.flash("error_msg", "Já existe um usuário com esta conta!")
                res.render("usuarios/registro")
            } else {
                const novoUsuario = ({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                    isAdmin: req.body.isAdmin
                })

                bcryptjs.genSalt(10, (erro, salt) => {
                    bcryptjs.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash("error_msg", "Houve um erro durante a criação!")
                            res.redirect("/")
                        }

                        novoUsuario.senha = hash
                                               
                        new Usuario(novoUsuario).save().then(() => {
                            req.flash("success_msg", "Usuário criado com sucesso!")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Erro ao criar usuário!")
                            res.render("usuarios/registro")
                        })
                    })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar usuário!")
            res.redirect("/")
        })
    }  
})

router.get('/registros', isAdmin, (req, res) => {
    Usuario.find().then((usuarios) => {
        res.render("usuarios/registros", {usuarios: usuarios})
    })
})

router.get('/registros/edit/:id', isAdmin, (req, res) => {
    Usuario.findOne({_id:req.params.id}).then((usuario) => {
        res.render("usuarios/editRegistro", {usuario: usuario})
    }).catch((err) => {
        req.flash("err_msg", "Erro ao editar registro!")
        res.redirect("usuarios/registros")
    })
})

router.post('/registros/editar', isAdmin, (req, res) => {

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined
        || req.body.nome == null) {
            erros.push({texto: "Nome inválido!"})
    }
    if(req.body.nome.length < 3) {
        erros.push({texto: "Nome muito pequeno!"})
    }
    if(!req.body.email || typeof req.body.email == undefined
        || req.body.email == null) {
            erros.push({texto: "Email inválido!"})
    }
    if(!req.body.senha || typeof req.body.senha == undefined
        || req.body.senha == null) {
            erros.push({texto: "Senha inválida!"})
    }
    if(req.body.senha.length < 3) {
        erros.push({texto: "Senha muito pequena!"})
    }
    if(!req.body.confirmaSenha || typeof req.body.confirmaSenha == undefined
        || req.body.confirmaSenha == null) {
            erros.push({texto: "Senha inválida!"})
    }
    if(req.body.confirmaSenha != req.body.senha) {
        erros.push({texto: "As senhas não são iguais!"})
    }

    if(erros.length > 0) {
        res.render("usuarios/editRegistro", {erros: erros})
    } else {
        Usuario.findOne({_id: req.body.id}).then((usuario) => {
                    usuario.nome = req.body.nome,
                    usuario.email = req.body.email,
                    usuario.senha = req.body.senha,
                    usuario.isAdmin = req.body.isAdmin

                bcryptjs.genSalt(10, (erro, salt) => {
                    bcryptjs.hash(usuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash("error_msg", "Houve um erro durante a edição!")
                            res.redirect("/usuarios/editRegistro")
                        }

                        usuario.senha = hash
                                    
                        usuario.save().then(() => {
                            req.flash("success_msg", "Usuário editado com sucesso!")
                            res.redirect("/usuarios/registros")
                        }).catch((err) => {
                            req.flash("error_msg", "Erro ao editar usuário!")
                            res.render("usuarios/editRegistro")
                        })
                    })
                })
        }).catch((err) => {
            req.flash("error_msg", "Erro ao encontrar usuário!")
            res.redirect("/")
        })
    }  
})

router.post('/registros/delete', isAdmin, (req, res) => {
    Usuario.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Registro deletado com sucesso!")
        res.redirect("/usuarios/registros")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar registro!")
        res.redirect("/usuarios/registros")
    })
})

router.get("/login", (req, res) => {
    res.render("usuarios/login")
})

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
})

router.get("/logout", (req, res) => {
    req.logout()
    req.flash("success_msg", "Deslogado com sucesso!")
    res.redirect("/")
})

module.exports = router