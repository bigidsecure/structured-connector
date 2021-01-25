export namespace BigID {

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
        getRecords(username: string, password: string, Offset?: number, Count?: number, paginationKey?: string): Promise<{records: Record[], paginationKey: string}>;

        /**
         * Search for records by field name and value.
         *
         * @param {number} Offset - The record number to skip. First record returned should be record number Offset+1.
         * @param {number} Count - The number of records to return.
         * @param {string} paginationKey - An optional key to get to the next page
         * @returns {Record[]} - A list of Records matching the criteria
         * @memberof Object
         */
        searchRecords(username: string, password: string, Offset?: number, Count?: number, paginationKey?: string, fieldName?: string, fieldValue?: string, isFullMatch?: boolean): Promise<{records: Record[], paginationKey: string}>;


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