/// <reference types="cypress" />
import contrato from'../contracts/usuarios.contract'

describe('Testes da Funcionalidade Usuários', () => {
     let token
    before(() => {
        cy.token('fulano@qa.com', 'teste').then(tkn => { token = tkn })
    });

    it('Deve validar contrato de usuários', () => {
          cy.request('usuarios').then(response => {
          return contrato.validateAsync(response.body)
      }) 
    });

    it('Deve listar usuários cadastrados', () => {
     cy.request({
          method: 'GET',
          url: 'usuarios'
      }).then((response) => {
          expect(response.body.usuarios[0].nome).to.equal('Fulano da Silva')
          expect(response.status).to.equal(200)
          expect(response.body).to.have.property('usuarios')
          expect(response.duration).to.be.lessThan(20)
      }) 
    });

    it('Deve cadastrar um usuário com sucesso', () => {
     let usuario = `Fulano Teste ${Math.floor(Math.random() * 100000000)}`
     let email = `${Math.floor(Math.random() * 100000000)}@cindalle.com`
     let password = `${Math.floor(Math.random() * 100000000)}`

     cy.request({
          method: 'POST',
          url: 'usuarios',
          body: {
              "nome": usuario,
              "email": email,
              "password": password,
              "administrador": 'true'
          },
          headers: { authorization: token }
      }).then((response) => {
          expect(response.status).to.equal(201)
          expect(response.body.message).to.equal('Cadastro realizado com sucesso')
      }) 
    });

    it('Deve validar um usuário com email que já esta sendo usado', () => {
     cy.cadastrarUsuario(token, 'Fulano Teste', '45473329@cindalle.com', '123', 'true')
     .then((response) => {
         expect(response.status).to.equal(400)
         expect(response.body.message).to.equal('Este email já está sendo usado')
     }) 
    });

    it('Deve validar um usuário com email inválido', () => {
     cy.cadastrarUsuario(token, 'Fulano Teste', 'xxxxx@xxxxx.x', '123', 'true')
     .then((response) => {
         expect(response.status).to.equal(400)
         expect(response.body.email).to.equal('email deve ser um email válido')
     }) 
    });

    it('Deve editar um usuário previamente cadastrado', () => {
     let usuario = `Fulano Teste ${Math.floor(Math.random() * 100000000)}`
     let email = `${Math.floor(Math.random() * 100000000)}@cindalle.com`
     cy.cadastrarUsuario(token, usuario, '51890111@cindalle.com', '123', 'true')
     cy.request('usuarios').then(response => {
          let id = response.body.usuarios[1]._id
          cy.request({
              method: 'PUT', 
              url: `usuarios/${id}`,
              headers: {authorization: token}, 
              body: 
              {
               "nome": usuario,
               "email": '51890111@cindalle.com',
               "password": '123',
               "administrador": 'true'
               }
          }).then(response => {
              expect(response.body.message).to.equal('Registro alterado com sucesso')
          })
      }) 
    });

    it('Deve deletar um usuário previamente cadastrado', () => {
     let usuario = `Fulano Teste ${Math.floor(Math.random() * 100000000)}`
     let email = `${Math.floor(Math.random() * 100000000)}@cindalle.com`
     let password = `${Math.floor(Math.random() * 100000000)}`
     cy.cadastrarUsuario(token, usuario, email, password, 'true')
     .then(response => {
         let id = response.body._id
         cy.request({
             method: 'DELETE',
             url: `usuarios/${id}`,
             headers: {authorization: token}
         }).then(response =>{
             expect(response.body.message).to.equal('Registro excluído com sucesso')
             expect(response.status).to.equal(200)
         })
     })   
    });


});
