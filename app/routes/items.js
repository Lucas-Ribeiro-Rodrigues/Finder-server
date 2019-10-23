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
            const trackedItems   = trackItem(req.body, extractObjsFromDocuments((await searchCollection.get()).docs));

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

    app.get("/items-management/items", async (req,res) => {
        const lostItemsCollection = await db.collection("lostItems");
        const foundItemsCollection = await db.collection("foundItems");
        let lostItems = extractObjsFromDocuments((await lostItemsCollection.get()).docs);
        let foundItems = extractObjsFromDocuments((await foundItemsCollection.get()).docs);
        let items =  [];
        items = items.concat(lostItems, foundItems);
        res.send(items);
    })

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

    app.get("/items-management/user-items/:userEmail", async (req,res) => {
        if(req.params.userEmail)
        {
            const lostItemsCollection = await db.collection("lostItems");
            let lostItems = extractObjsFromDocuments((await lostItemsCollection.get()).docs);
            lostItems.filter(element => {
                return element.User === req.params.userEmail
            })
            res.send(lostItems);
        }
        else
            res.status(406).send("Missing request parameters")
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

    /*filtra os itens que são similares ao item buscado e retorna-os ordenados por ordem decrescente de similaridade*/
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
                let inRange = isInRange(item.Location, element.Location, 200);
                if(!inRange) //se for um animal, pode estar à mais de 200m de distância do local onde se perdeu
                {
                    if(item.Category != 'Animal')    
                        return false;
                }
                else
                {
                    similarity += 5;
                }
                weightsSum += 5;
                delete itemCopy.Location;
            }

            if(item.Date && element.Date)
            {
                if(item.Date === element.Date)
                    similarity += 2;

                weightsSum += 2;
                delete itemCopy.Date;
            }

            for(let prop in itemCopy)
            {
                if(itemCopy[prop] === element[prop])
                    similarity++;
                
                weightsSum++;
            }
            element["Similarity"] = similarity;
            return similarity >= parseInt(weightsSum * 0.7);
        }).sort((a,b) => {
            if(a.Similarity < b.Similarity)
                return 1; // ordenar em ordem decrescente;
            else
                return -1;
        });
    }

    /*calcula a distância entre os dois itens usando a fórmula de Haversine e verifica se o ponto está dentro de um raio do centro*/ 
    function isInRange(point, center, radius){ 
        var earthRadius = 6378.137; // raio da terra em KM
        var dLat = point.latitude * Math.PI / 180 - center.latitude * Math.PI / 180;
        var dLon = point.longitude * Math.PI / 180 - center.longitude * Math.PI / 180;
        var a = Math.pow(Math.sin(dLat/2), 2) + 
                Math.cos(point.latitude * Math.PI / 180) * Math.cos(center.latitude * Math.PI / 180) *
                Math.pow(Math.sin(dLon/2), 2);
        var arcsin = Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var distance = earthRadius * 2 * arcsin * 1000;
        return distance<=radius;
    }
}