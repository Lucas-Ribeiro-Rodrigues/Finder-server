const db = require("../../config/firebaseConfig");

module.exports = app => {
    const collection = db.collection("users");

    app.post('/users-management/user-login', async (req, res) => {
        if(req.body != undefined)
        {
            const documents = await collection.get();
            let user = null;
            for(let i=0; i < documents.docs.length; i++)
            {
                let doc = extractUser(documents.docs[i]);
                console.log(doc);
                console.log(req.body.Nick);
                if(doc.Nick == req.body.Nick && doc.Password == req.body.Password)
                {
                    user = doc;
                    break;
                }
            }

            if(user)
            {
                res.send({
                    user:{
                        Nick: user.Nick,
                    }
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

    const extractUser = (doc) => {
        let user = doc.data();
        return{
            id: doc.id,
            Nick: user.Nick,
            Password: user.Password
        }
    }
}