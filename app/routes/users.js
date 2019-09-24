const db = require("../../config/firebaseConfig");

module.exports = app => {
    const usersCollection = db.collection("users");

    app.post('/users-management/user-login', async (req, res) => {
        if(req.body)
        {
            const documents = await usersCollection.get();
            let user = null;
            for(let i=0; i < documents.docs.length; i++)
            {
                let doc = extractUser(documents.docs[i]);
                if(doc.Email == req.body.Email && doc.Password == req.body.Password)
                {
                    user = doc;
                    break;
                }
            }

            if(user)
            {
                res.send({
                    Name: user.Name,
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
                "Email": req.body.Email,
                "Password": req.body.Password, 
            }
            const firebaseReturn = await usersCollection.add(user);
            if(firebaseReturn)
                res.send(`Vaga ${firebaseReturn.id} adicionada com sucesso`);
            else
                res.status(500).send("Erro ao cadastrar usuario");
        }
        else
        {
            res.status(406).send("request body not found");
        }
    })

    app.get("/users-management/user/{email}", async (req,res) => {
        
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