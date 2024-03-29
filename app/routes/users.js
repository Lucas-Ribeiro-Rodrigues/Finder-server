const db = require("../../config/firebaseConfig");

module.exports = app => {
    const usersCollection = db.collection("users");

    app.post('/users-management/user-login', async (req, res) => {
        if(req.body)
        {
            const documents = await usersCollection.get();
            let user = null;
            let reqEmail = req.body.Email.toUpperCase().replace(" ", "");
            let reqPassword = req.body.Password.toUpperCase();
            for(let i=0; i < documents.docs.length; i++)
            {
                let doc = extractUser(documents.docs[i]);
                console.log("req: " + reqEmail + " doc: " + doc.Email.toUpperCase());
                console.log(reqEmail == doc.Email.toUpperCase());
                if(doc.Email.toUpperCase() == reqEmail && doc.Password.toUpperCase() == reqPassword)
                {
                    user = doc;
                    break;
                }
            }

            if(user)
            {
                res.send({
                    Name: user.Name,
                    Email: user.Email
                })
            }
            else
                res.status(500).send("Login Inválido");
        }
        else
        {
            res.status(406).send("request body not found");
        }    
    })

    app.post("/users-management/user-register", async (req,res) => {
        if(req.body)
        {
            let user = {
                "Name": req.body.Name,
                "Email": req.body.Email.replace(" ", ""),
                "Password": req.body.Password, 
            }
            const firebaseReturn = await usersCollection.add(user);
            if(firebaseReturn)
                res.send(`Usuario cadastrado com sucesso`);
            else
                res.status(500).send("Erro ao cadastrar usuario");
        }
        else
        {
            res.status(406).send("request body not found");
        }
    })

    app.get("/users-management/user/:email", async (req,res) => {
        let email = req.params.email;
        if(email)
        {
            /* pesquisar no firebase as infos */
            const documents = await usersCollection.get();
            let user = null;
            for(let i=0; i < documents.docs.length; i++)
            {
                let doc = extractUser(documents.docs[i]);
                if(doc.Email == email)
                {
                    user = doc;
                    break;
                }
            }

            if(user)
            {
                console.log('user entrou');
                res.send({
                    Name: user.Name,
                    Email: user.Email
                })
            }
            else
                res.status(500).send("Usuário não encontrado");
            
        }
        else
        {
            res.status(406).send("request body not found");
        }
    })

    const extractUser = (doc) => {
        let user = doc.data();
        return{
            id: doc.id,
            Name: user.Name,
            Email: user.Email,
            Password: user.Password
        }
    }
}
/*
Mensagens para status
200: tudo OK
201: criado
400: sua requisição tem algum problema
404: o conteúdo que você pediu não foi encontrado
500: deu um problema no nosso servidor
503: serviço inoperante
*/