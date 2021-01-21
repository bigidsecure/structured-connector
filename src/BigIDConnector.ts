import express from 'express'
import auth from 'basic-auth'
import Customer from './Objects/Customer';

export function BigIDConnector(app: express.Application) {

    // Build our objects cache
    let objectCache: any = {};
    objectCache["Customer"] = new Customer();

    app.get('/objects', async (req: express.Request, res: express.Response) => {
        // UNCOMMENT
        // let creds = auth(req);
        // if (creds === undefined) {
        //    return res.status(500).send({ status: 'error', message: 'No credentials' });
        // }
        // UNCOMMENT

        let result: any = { status: 'success', objects: [] };
        for (let object in objectCache) {
            let thisObject: any = {};
            thisObject.objectName = object;
            thisObject.fields = await objectCache[object].getFields("creds.name", "creds.pass");
            
            result.objects.push(thisObject);
        }
        return res.send(result);
    });

    // This endpoint lists the number of records of this object.
    // For example, in an SQL database it would be the number of rows
    // in a table.
    app.get('/objects/:objectName/count', async (req, res) => {
        let creds = auth(req);
        if (creds === undefined) {
            return res.status(500).send({ status: 'error', message: 'No credentials' });
        }

        return res.send({ status: "success", count: await objectCache[req.params.objectName].getRecordCount(creds.name, creds.pass) });
    });

    // This endpoint lists the fields for this object.
    // For example, in an SQL database this would be the column definitions
    // and types.
    app.get('/objects/:objectName/describe', async (req, res) => {

        let creds = auth(req);
        if (creds === undefined) {
            return res.status(500).send({ status: 'error', message: 'No credentials' });
        }

        return res.send({ status: "success", objectName: req.params.objectName, fields: await objectCache[req.params.objectName].getFields(creds.name, creds.pass) });
    });

    // This endpoint returns records from an object.
    // Each record must have have a unique ID.
    // For example, in an SQL database this would be a print out of all 
    // rows in a given table.
    app.get('/objects/:objectName/records', async (req, res) => {

        let creds = auth(req);
        if (creds === undefined) {
            return res.status(500).send({ status: 'error', message: 'No credentials' });
        }

        let records = await objectCache[req.params.objectName].getRecords(creds.name, creds.pass, req.query.Offset, req.query.Count, req.query.paginationKey);
        return res.send({ status: "success", objectName: req.params.objectName, records: records, offset: records.length+parseInt(req.query.Offset as string) });
    });

    // This endpoint returns a specific record based upon it's ID.
    // For example, in an SQL database you would supply a primary 
    // key and recieve a record.
    app.get('/objects/:objectName/records/:recordId', async (req, res) => {

        let creds = auth(req);
        if (creds === undefined) {
            return res.status(500).send({ status: 'error', message: 'No credentials' });
        }

        return res.send({ status: "success", objectName: req.params.objectName, records: await objectCache[req.params.objectName].getRecord(creds.name, creds.pass, req.params.recordId) });
    });

    // This endpoint gets records that match specific criteria
    app.get('/objects/:objectName/sar', async (req, res) => {

        let creds = auth(req);
        if (creds === undefined) {
            return res.status(500).send({ status: 'error', message: 'No credentials' });
        }

        let records = await objectCache[req.params.objectName].searchRecords(creds.name, creds.pass, req.query.Offset, req.query.Count, req.query.paginationKey,req.query.fieldName,req.query.fieldValue,req.query.isFullMatch === "true");
        return res.send({ status: "success", objectName: req.params.objectName, records: records, offset: records.length+parseInt(req.query.Offset as string) });
    });
}

export namespace BigIDConnector {

    /**
     * A type of object that should be scanned.
     * Example: Customers.
     * @export
     * @interface Object
     */
    export interface Object {

        /**
         * A Name for this type of object. Must be unique.
         * Example: Customer
         * @type {string}
         * @memberof Object
         */
        Name: string;
        /**
         * A list of possible fields for this type of object.
         * @returns {Field[]}
         * @memberof Object
         */
        getFields(username: string, password: string): Promise<Field[]>;

        /**
         * Get a count of how many instances of this type you have.
         * @returns {number}
         * @memberof Object
         */
        getRecordCount(username: string, password: string): Promise<number>;

        /**
         * Get a specified number of records.
         *
         * @param {number} Offset - The record number to skip. First record returned should be record number Offset+1.
         * @param {number} Count - The number of records to return.
         * @param {string} paginationKey - An optional key to get to the next page
         * @returns {Record[]} - A list of Records matching the criteria
         * @memberof Object
         */
        getRecords(username: string, password: string, Offset?: number, Count?: number, paginationKey?: string): Promise<Record[]>;

        /**
         * Search for records by field name and value.
         *
         * @param {number} Offset - The record number to skip. First record returned should be record number Offset+1.
         * @param {number} Count - The number of records to return.
         * @param {string} paginationKey - An optional key to get to the next page
         * @returns {Record[]} - A list of Records matching the criteria
         * @memberof Object
         */
        searchRecords(username: string, password: string, Offset?: number, Count?: number, paginationKey?: string, fieldName?: string, fieldValue?: string, isFullMatch?: boolean): Promise<Record[]>;


        /**
         * Get a single record.
         *
         * @param {string} id - The unique ID for this record found at Record.id.
         * @returns {Record} - The requested record.
         * @memberof Object
         */
        getRecord(username: string, password: string, id: string): Promise<Record>;

    }

    /**
     * A field within your object.
     * Example: A Customer's first name. {fieldName: 'FirstName', fieldType: 'string'}
     * @export
     * @interface Field
     */
    export interface Field {
        fieldName: string;
        fieldType: string;
    }

    /**
     * A single instance of your object.
     * Example: Alex Bulis, your customer.
     * @export
     * @interface Record
     */
    export interface Record {
        /**
         * A unique ID for this record. 
         * It MUST be unique across all records of this type.
         * @type {string}
         * @memberof Record
         */
        id: string;

        /**
         * The data for this instance of your object.
         * Example: [{
         * fieldName: 'FirstName',
         * fieldValue: 'Alex'
         * }]
         * @type {DataValue[]}
         * @memberof Record
         */
        data: DataValue[];
    }


    /**
     * A piece of information from a record.
     * Example: {
     * fieldName: 'FirstName',
     * fieldValue: 'Alex'
     * }
     * @export
     * @interface DataValue
     */
    export interface DataValue {
        fieldName: string;
        fieldValue: string;
        fieldType: string;
    }
}