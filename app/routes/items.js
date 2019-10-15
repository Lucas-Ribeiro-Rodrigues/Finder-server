const db = require("../../config/firebaseConfig");

module.exports = app => {

    //const itemsCollection = db.collection("items");

    app.post("/items-management/item-register", async (req,res) => {
        if(req.body)
        {
            let situation = req.body.Situation;
            let itemsCollection;
            let searchCollection;

            if(situation == "Lost")
            {
                itemsCollection = await db.collection("lostItems");
                searchCollection = await db.collection("foundItems");                
            }
            else
            if(situation == "Found")
            {
                itemsCollection = await db.collection("foundItems"); 
                searchCollection = await db.collection("lostItems");                 
            }

            const firebaseReturn = await itemsCollection.add(req.body);    
            const trackedItems   = this.trackItem(req.body, this.extractObjsFromDocuments(await searchCollection.get()));

            if(firebaseReturn)
                res.send({trackedItems: trackedItems});
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

    const trackItem = (item, items) => {
        return items.filter((element) => {
            let similarity = 0; //grau de similaridade do elemento com o item
            let weightsSum = 0; // soma de todos os pesos para a média de similaridade 
            let itemCopy = Object.assign({}, item);
            if(JSON.stringify(element) === JSON.stringify(item))
                return true;
            
            if(item.Category != element.Category || item.Subcategory != element.Subcategory)
                return false;

            delete itemCopy.Category, itemCopy.Subcategory;

            if(item.Location && element.Location)
            {
                let isInRange = isInRange(item.Location, element.Location, 200);
                if(!isInRange) //se for um animal, pode estar à mais de 200m de distância do local onde se perdeu
                {
                    if(item.Category != 'Animal')    
                        return false;
                }
                else
                {
                    similarity += 3;
                }
                weightsSum += 3;
                delete itemCopy.Location;
            }

            if(item.Date && element.Date)
            {
                if(item.Date === element.Date)
                    similarity += 2;

                weightsSum += 2;
                delete itemCopy.Date;
            }

            let itemProperties = Object.keys(itemCopy);
            for(const prop of itemProperties)
            {
                if(itemCopy[prop] === element[prop])
                    similarity++;
                
                weightsSum++;
            }

            return similarity >= weightsSum * 0.7;
        })
    }

    function isInRange(point, center, radius) //coordenadas do ponto a ser verificado, do ponto de referência (centro) e do raio em que o item deve estar
    {
        let latitudeDistance = ((point.latitude - center.latitude)/60) * 1857; //de graus para milhas náuticas e depois para metros
        let longitudeDistance = ((point.longitude - center.longitude)/60) * 1857; //de graus para milhas náuticas e depois para metros
        let distance = Math.sqrt(Math.pow(latitudeDistance, 2) + Math.pow(longitudeDistance, 2));
        return distance <= radius;
    }
}