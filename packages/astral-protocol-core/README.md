# `astral-protocol-core`

> TODO: description

## Usage

```
import {  AstralClient } from "./astral-client";
import data from "./data/stacitem.json"

let astral = new AstralClient()

async function runApp(){

    // create GeoDIDDoc and receive the geodid id 
    // @params STAC_ITEM (data) and Ethereum Address (ethrAddress = '0xcF56B3442eBC30EDe0838334419b5a80eEa45da8')
    const geodidid = await astral.createGeoDID(data, ethrAddress);
    
    // Use the resolver to obtain the did document itself 
    // @params geodidid = "did:geo:QmQhrMWAyxPRpFnS1UPZSUmKj7N7DNNSWi2cfQYDMR4Zgm"
    const geodiddoc = await astral.loadDocument(geodidid);    

};

runApp()

```
