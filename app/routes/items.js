const db = require("../../config/firebaseConfig");

module.exports = app => {

    //const itemsCollection = db.collection("items");

    app.post("/items-management/item-register", async (req,res) => {
        if(req.body)
        {
            let situation = req.body.Situation;
            let itemsCollection;

            if(situation == "Lost")
                itemsCollection = await db.collection("lostItems");
            else
            if(situation == "Found")
                itemsCollection = await db.collection("foundItems");

            const firebaseReturn = await itemsCollection.add(req.body);

            if(firebaseReturn)
                res.send("Item adicionado com sucesso");
            else
                res.status(500).send("Erro ao inserir item");
        }
        else
        {
            res.status(406).send("request body not found");
        }
    });

    app.get("/items-management/items/:situation", async (req,res) => {
        let situation = req.params.situation;
        if(situation)
        {
            let itemsCollection;
            if(situation == "Lost")
                itemsCollection = await db.collection("lostItems");
            else
            if(situation == "Found")
                itemsCollection = await db.collection("foundItems");
            
            let documents = await itemsCollection.get();
    
            res.send(extractObjsFromDocuments(documents.docs));
        }
        else
        {
            res.status(406).send("request parameters not found");
        }
    })

    app.get("/items-management/items", async (req,res) => {
        const lostItemsCollection = await db.collection("lostItems");
        const foundItemsCollection = await db.collection("foundItems");
        let lostItems = extractObjsFromDocuments((await lostItemsCollection.get()).docs);
        let foundItems = extractObjsFromDocuments((await foundItemsCollection.get()).docs);
        let items =  [];
        items = items.concat(lostItems, foundItems);
        res.send(items);
    })

    const extractObjsFromDocuments = (documents) =>
    {
        let ret = [];
        for(const document of documents)
        {
            ret.push(document.data());
        }
        return ret;
    }
    /*const extractItem = (doc) => {
        let item = doc;
        return{
            id: doc.id,
            Name: user.Name,
            Email: user.Email,
            Password: user.Password
        }
    }*/
}