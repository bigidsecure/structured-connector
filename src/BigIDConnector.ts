import express from 'express'
import auth from 'basic-auth'
import Customer from './Objects/Customer';
import {BigID} from './BigID'

export function BigIDConnector(app: express.Application) {

    let objectCache: any = {};
    // ADD CUSTOMER TO ROUTING CODE
    // UNCOMMENT
    objectCache["Customer"] = new Customer();
    // UNCOMMENT
    // END ADD CUSTOMER TO ROUTING CODE


    app.get('/objects', async (req: express.Request, res: express.Response) => {

        // USE BASIC AUTH FROM BIGID
        // BigID sends credentials to connectors as Basic Auth. 
        // Since we're using them in our connector code, we should require them to be supplied.
        // UNCOMMENT
        let creds = auth(req);
        if (creds === undefined) {
            return res.status(500).send({ status: 'error', message: 'No credentials' });
        }
        // UNCOMMENT
        // END USE BASIC AUTH FROM BIGID

        // DON'T USE AUTH
        // COMMENT
        // let creds = {name: "", pass:""}
        // COMMENT
        // END DON'T USE AUTH

        // FORMAT OBJECTS
        // UNCOMMENT
        let result: any = { status: 'success', objects: [] };
        // Loop through each object that we've declared at the top of the file.
        for (let object in objectCache) {
            let thisObject: any = {};
            // Each object needs a name
            thisObject.objectName = object;
            thisObject.fields = await objectCache[object].getFields(creds.name, creds.pass);
            
            result.objects.push(thisObject);
        }
        // UNCOMMENT
        // END FORMAT OBJECTS
        return res.send(result);
    });

    // This endpoint lists the fields for an object.
    // For example, in an SQL database this would be the column definitions
    // and types.
    app.get('/objects/:objectName/describe', async (req, res) => {

        // USE BASIC AUTH FROM BIGID
        // UNCOMMENT
        let creds = auth(req);
        if (creds === undefined) {
            return res.status(500).send({ status: 'error', message: 'No credentials' });
        }
        // UNCOMMENT
        // END USE BASIC AUTH FROM BIGID

        // DON'T USE AUTH
        // COMMENT
        // let creds = {name: "", pass:""}
        // COMMENT
        // END DON'T USE AUTH
        
        if(objectCache[req.params.objectName] === undefined){
            return res.status(404).send({status: "error", "message": "Not Found"});
        }

        return res.send({ status: "success", objectName: req.params.objectName, fields: await objectCache[req.params.objectName].getFields(creds.name, creds.pass) });
    });

    // This endpoint lists the number of records of this object.
    // For example, in an SQL database it would be the number of rows
    // in a table.
    app.get('/objects/:objectName/count', async (req, res) => {
        
        // USE BASIC AUTH FROM BIGID
        // UNCOMMENT
        let creds = auth(req);
        if (creds === undefined) {
            return res.status(500).send({ status: 'error', message: 'No credentials' });
        }
        // UNCOMMENT
        // END USE BASIC AUTH FROM BIGID

        // DON'T USE AUTH
        // COMMENT
        // let creds = {name: "", pass:""}
        // COMMENT
        // END DON'T USE AUTH

        return res.send({ status: "success", count: await objectCache[req.params.objectName].getRecordCount(creds.name, creds.pass) });
    });

    // This endpoint returns records from an object.
    // Each record must have have a unique ID.
    // For example, in an SQL database this would be a print out of all 
    // rows in a given table.
    app.get('/objects/:objectName/records', async (req, res) => {

        // USE BASIC AUTH FROM BIGID
        // UNCOMMENT
        let creds = auth(req);
        if (creds === undefined) {
            return res.status(500).send({ status: 'error', message: 'No credentials' });
        }
        // UNCOMMENT
        // END USE BASIC AUTH FROM BIGID

        // DON'T USE AUTH
        // COMMENT
        // let creds = {name: "", pass:""}
        // COMMENT
        // END DON'T USE AUTH

        let offset = parseInt(req.query.Offset as string);
        if(isNaN(offset)){
            offset = 0;
        }

        let records = await objectCache[req.params.objectName].getRecords(creds.name, creds.pass, offset, req.query.Count, req.query.paginationKey);
        return res.send({ status: "success", objectName: req.params.objectName, records: records.records, offset: records.records.length+offset, paginationKey: records.paginationKey });
    });

    // This endpoint returns a specific record based upon it's ID.
    // For example, in an SQL database you would supply a primary 
    // key and recieve a record.
    app.get('/objects/:objectName/records/:recordId', async (req, res) => {

        // USE BASIC AUTH FROM BIGID
        // UNCOMMENT
        let creds = auth(req);
        if (creds === undefined) {
           return res.status(500).send({ status: 'error', message: 'No credentials' });
        }
        // UNCOMMENT
        // END USE BASIC AUTH FROM BIGID

        // DON'T USE AUTH
        // COMMENT
        // let creds = {name: "", pass:""}
        // COMMENT
        // END DON'T USE AUTH

        return res.send({ status: "success", objectName: req.params.objectName, records: await objectCache[req.params.objectName].getRecord(creds.name, creds.pass, req.params.recordId) });
    });

    // This endpoint gets records that match specific criteria
    // CHANGE TO APP.POST
    app.get('/objects/:objectName/sar', async (req, res) => {

        // USE BASIC AUTH FROM BIGID
        // UNCOMMENT
        let creds = auth(req);
        if (creds === undefined) {
            return res.status(500).send({ status: 'error', message: 'No credentials' });
        }
        // UNCOMMENT
        // END USE BASIC AUTH FROM BIGID

        // DON'T USE AUTH
        // COMMENT
        // let creds = {name: "", pass:""}
        // COMMENT
        // END DON'T USE AUTH

        req.body = req.query; // REMOVE THIS LINE FOR POST

        let offset = parseInt(req.query.Offset as string);
        if(isNaN(offset)){
            offset = 0;
        }

        let records = await objectCache[req.params.objectName].searchRecords(creds.name, creds.pass, offset, req.query.Count, req.query.paginationKey, req.body.fieldName, req.body.fieldValue, req.body.isFullMatch === "true");
        return res.send({ status: "success", objectName: req.params.objectName, records: records.records, offset: records.records.length+offset, paginationKey: records.paginationKey });
    });

}