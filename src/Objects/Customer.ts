import fetch from "node-fetch";
import { BigID } from "../BigID";

export default class Customer implements BigID.Object {

    Name = 'Customer';

    /**
     * Return what fields a customer should have so BigID knows what data is inside a Customer.
     *
     * @param {string} username
     * @param {string} password
     * @returns {Promise<BigIDConnector.Field[]>} Fields
     * @memberof Customer
     */
    async getFields(username: string, password: string): Promise<BigID.Field[]> {

        /* We're going to start with a sample response from the Shopify API.
         * This allows us to determine the type and other information about
         * our customer fields without manual work.
         * 
         * In a production connector, you would save off the fields to save
         * processing power.
         */
        //UNCOMMENT
        let SampleResponse = {
            "id":4458521428166,
            "email":"scooby.doo@mac.com",
            "accepts_marketing":false,
            "created_at":"2020-11-20T13:20:32-05:00",
            "updated_at":"2020-11-20T13:20:32-05:00",
            "first_name":"Scooby",
            "last_name":"Doo",
            "orders_count":0,
            "state":"disabled",
            "total_spent":"0.00",
            "last_order_id":null,
            "note":null,
            "verified_email":true,
            "multipass_identifier":null,
            "tax_exempt":false,
            "phone":null,
            "tags":"",
            "last_order_name":null,
            "currency":"USD",
            "addresses":[
               {
                  "id":5461372108998,
                  "customer_id":4458521428166,
                  "first_name":"Scooby",
                  "last_name":"Doo",
                  "company":null,
                  "address1":"50 Post Rd",
                  "address2":null,
                  "city":"Boston",
                  "province":"Massachusetts",
                  "country":"United States",
                  "zip":"02108-6300",
                  "phone":null,
                  "name":"Scooby Doo",
                  "province_code":"MA",
                  "country_code":"US",
                  "country_name":"United States",
                  "default":true
               }
            ],
            "accepts_marketing_updated_at":"2020-11-20T13:20:32-05:00",
            "marketing_opt_in_level":null,
            "tax_exemptions":[
               
            ],
            "admin_graphql_api_id":"gid://shopify/Customer/4458521428166",
            "default_address":{
               "id":5461372108998,
               "customer_id":4458521428166,
               "first_name":"Scooby",
               "last_name":"Doo",
               "company":null,
               "address1":"50 Post Rd",
               "address2":null,
               "city":"Boston",
               "province":"Massachusetts",
               "country":"United States",
               "zip":"02108-6300",
               "phone":null,
               "name":"Scooby Doo",
               "province_code":"MA",
               "country_code":"US",
               "country_name":"United States",
               "default":true
            }
         };

        // Flatten the object. BigID connectors cannot have nested objects.
        const flatSample = this.flatten(SampleResponse);

        // Convert the object into Fields.
        let result: BigID.Field[] = [];
        for (let index in flatSample) {
            result.push({ fieldName: index, fieldType: typeof (flatSample[index]) })
        }

        // Return the Fields
        return result;
        // UNCOMMENT
    }

    async getRecords(username: string,  password: string, Offset?: number, Count?: number, paginationKey?: string) {

        // USE URL FROM ENVIRONMENT
        // COMMENT
        // let BaseURL = 'https://bigid-training.myshopify.com'
        // let API_KEY = process.env.API_KEY as string;
        // COMMENT
        // END USE URL FROM ENVIRONMENT

        // USE URL AND PASSWORD FROM BIGID
        // UNCOMMENT
        let BaseURL = username;
        let API_KEY = password;
        // UNCOMMENT
        // END USE URL AND PASSWORD FROM BIGID

        let queryParams = new Array();

        // INCREMENTAL DATA LOADING
        // UNCOMMENT
        // Shopify uses a pagination key to load the next page.
        if (paginationKey) {
            queryParams.push("page_info=" + paginationKey);
        }
        // Shopify uses the "limit" parameter to serve the same purpose as our Count
        if (Count) {
            if(Count > 250){
                Count = 250;
            }
            queryParams.push("limit=" + Count);
        }
        // UNCOMMENT
        // END INCREMENTAL DATA LOADING

        // FETCH RECORDS FROM SHOPIFY
        // UNCOMMENT
        // Shopify's API allows us to directly query it using a GET request.
        // They require an access token to do so. I've included it in your VM for you.
        const request = await fetch(BaseURL + "/admin/api/2020-10/customers.json?" + queryParams.join("&"),
            {
                headers: {
                    "X-Shopify-Access-Token": API_KEY
                }
            });

        // Shopify uses a header to tell you the pagination key
        // The format is:
        // Link: "<https://{shop}.myshopify.com/admin/api/{version}/products.json?page_info={page_info}&limit={limit}>; rel={next}, <https://{shop}.myshopify.com/admin/api/{version}/products.json?page_info={page_info}&limit={limit}>; rel={previous}"
        // So we need to actually just get the page_info key. Let's use regex to parse that out
        // GET PAGINATION KEY
        // UNCOMMENT
        let nextKey = "";
        let linkHeader = request.headers.get("link");
        if(!(linkHeader === undefined || linkHeader === null)){
            let match = linkHeader.match(/page_info=([a-zA-Z0-9]+).*>; rel="next"/);
            if(match !== null && match[1] !== undefined) {
                nextKey = match[1];
            }
        }
        // UNCOMMENT
        // END GET PAGINATION KEY

        const data = await request.json();

        let result: BigID.Record[] = new Array();
        // After we have our data from Shopify, we need to format it.
        // Thankfully we already wrote code to do this earlier with our sample request.
        // Loop through each customer
        for (let customer of data.customers) {
            // Pull out the customer ID and make that the record ID.
            // Remember that every record MUST have a unique ID.
            let thisCustomer = { id: customer.id, data: new Array() };

            // BigID doesn't support nested objects. So let's flatten our 
            // customer object just like before.
            customer = this.flatten(customer);

            // Go through each property of our flattened object and transform it into the needed format of:
            // fieldName: name, fieldValue: value, fieldType: type
            // In this case we can just use typescript types to determine what type.
            for (let prop in customer) {
                thisCustomer.data.push({ fieldName: prop, fieldValue: customer[prop] || "", fieldType: typeof (customer[prop] || "") })
            }
            result.push(thisCustomer);
        }
        // Return our customers to our routing code in the right format.
        // The routing code will worry about things like the offset for us.
        return {records: result, paginationKey: nextKey};
        // UNCOMMENT
        // END FETCH RECORDS FROM SHOPIFY
    }

    async getRecordCount(username: string, password: string) {

        // USE URL FROM ENVIRONMENT
        // COMMENT
        // let BaseURL = 'https://bigid-training.myshopify.com'
        // let API_KEY = process.env.API_KEY as string;
        // COMMENT
        // END USE URL FROM ENVIRONMENT
        
        // USE URL AND PASSWORD FROM BIGID
        // UNCOMMENT
        let BaseURL = username;
        let API_KEY = password;
        // UNCOMMENT
        // END USE URL AND PASSWORD FROM BIGID

        // Get Record Count
        const request = await fetch(BaseURL + "/admin/api/2020-10/customers/count.json",
            {
                headers: {
                    "X-Shopify-Access-Token": API_KEY
                }
            });

        const data = await request.json();
        return data.count;
    }

    async getRecord(username: string, password: string, id: string) {

        // USE URL FROM ENVIRONMENT
        // COMMENT
        // let BaseURL = 'https://bigid-training.myshopify.com'
        // let API_KEY = process.env.API_KEY as string;
        // COMMENT
        // END USE URL FROM ENVIRONMENT
        
        // USE URL AND PASSWORD FROM BIGID
        // UNCOMMENT
        let BaseURL = username;
        let API_KEY = password;
        // UNCOMMENT
        // END USE URL AND PASSWORD FROM BIGID

        // Send a request to Shopify for a specific customer ID
        const request = await fetch(BaseURL + "/admin/api/2020-10/customers/" + id + ".json",
            {
                headers: {
                    "X-Shopify-Access-Token": API_KEY
                }
            });
            
        const data = await request.json();
        // Flatten the customer record for BigID
        let customer = this.flatten(data.customer);

        // Create a new Record object so BigID can understand it.
        // Remember, every record must have an object unique ID.
        let thisCustomer = { id: customer.id, data: new Array() };
        for (let prop in customer) {
            thisCustomer.data.push({ fieldName: prop, fieldValue: customer[prop] || "", fieldType: typeof (customer[prop] || "") })
        }
        // Return to the routing code
        return thisCustomer;
    }

    async searchRecords(username: string, password: string, Offset?: number, Count?: number, paginationKey?: string, fieldName?: string, fieldValue?: string, isFullMatch?: boolean) {
        // USE URL FROM ENVIRONMENT
        // Use a hardcoded username and password
        // COMMENT
        // let BaseURL = 'https://bigid-training.myshopify.com'
        // let API_KEY = process.env.API_KEY as string;
        // COMMENT
        // END USE URL FROM ENVIRONMENT
        
        // USE URL AND PASSWORD FROM BIGID
        // Use the username and password passed from our route
        // UNCOMMENT
        let BaseURL = username;
        let API_KEY = password;
        // UNCOMMENT
        // END USE URL AND PASSWORD FROM BIGID
        
        let queryParams = new Array();

        // CONSTRUCT SEARCH
        // UNCOMMENT
        // Since we're flattening fields and Shopify doesn't allow searching by paths
        // just take the last part of our flattened path for field names.
        // ex: address.phone == phone
        if(fieldName && fieldName.includes(".")){
            fieldName = fieldName.split(".").pop();
        }

        // Implement the count parameter like in previous sections
        if (Count) {
            queryParams.push("limit=" + Count);
        }

        // If we are NOT doing a full match, we are just going to search for the value
        // Shopify does not have a way to do partial matches besides this.
        if (fieldValue && fieldName && isFullMatch !== true) {
            queryParams.push("query="+fieldValue)
        }
        // If we are doing a full match we should match on the field and value in quotes
        // This will ensure only
        if (fieldValue && fieldName && isFullMatch == true) {
            queryParams.push("query=" + fieldName + ':"' + fieldValue+'"')
        }

        // If we have a pagination key, we can't also have a query (it's built into the key)
        // So replace everything in our query with the key
        if (paginationKey) {
            queryParams = ["page_info=" + paginationKey]
        }
        // UNCOMMENT
        // END CONSTRUCT SEARCH

        const request = await fetch(BaseURL + "/admin/api/2020-10/customers/search.json?" + queryParams.join("&"),
            {
                headers: {
                    "X-Shopify-Access-Token": API_KEY
                }
            });
        const data = await request.json();

        let nextKey = "";
        let linkHeader = request.headers.get("link");
        if(!(linkHeader === undefined || linkHeader === null)){
            let match = linkHeader.match(/page_info=([a-zA-Z0-9]+).*>; rel="next"/);
            if(match !== null && match[1] !== undefined) {
                nextKey = match[1];
            }
        }

        let result: BigID.Record[] = new Array();
        for (let customer of data.customers) {
            let thisCustomer = { id: customer.id, data: new Array() };
            customer = this.flatten(customer);
            for (let prop in customer) {
                thisCustomer.data.push({ fieldName: prop, fieldValue: customer[prop] || "", fieldType: typeof (customer[prop] || "") })
            }
            result.push(thisCustomer);
        }
        return {records: result, paginationKey:nextKey};
    }

    flatten(obj: any, prefix = '', res: any = {}) {
        return Object.entries(obj).reduce((r, [key, val]) => {
            const k = `${prefix}${key}`
            if (typeof val === 'object' && val != null) {
                this.flatten(val, `${k}.`, r)
            } else {
                res[k] = val || "";
            }
            return r
        }, res)
    }

}