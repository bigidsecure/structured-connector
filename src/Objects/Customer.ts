import fetch from "node-fetch";
import { BigIDConnector } from "../BigIDConnector";

export default class Customer implements BigIDConnector.Object {

    Name = 'Customer';
    BaseURL = 'https://bigid-training.myshopify.com'

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

    async getFields(username: string, password: string) {
        let SampleResponse = {
            "id": 1073339460,
            "email": "steve.lastnameson@example.com",
            "accepts_marketing": false,
            "created_at": "2020-11-04T16:31:01-05:00",
            "updated_at": "2020-11-04T16:31:01-05:00",
            "first_name": "Steve",
            "last_name": "Lastnameson",
            "orders_count": 0,
            "state": "disabled",
            "total_spent": "0.00",
            "last_order_id": 'null',
            "note": 'null',
            "verified_email": true,
            "multipass_identifier": 'null',
            "tax_exempt": false,
            "phone": "+15142546011",
            "tags": "",
            "last_order_name": 'null',
            "currency": "USD",
            "addresses": [
                {
                    "id": 1053317292,
                    "customer_id": 1073339460,
                    "first_name": "Mother",
                    "last_name": "Lastnameson",
                    "company": 'null',
                    "address1": "123 Oak St",
                    "address2": 'null',
                    "city": "Ottawa",
                    "province": "Ontario",
                    "country": "Canada",
                    "zip": "123 ABC",
                    "phone": "555-1212",
                    "name": "Mother Lastnameson",
                    "province_code": "ON",
                    "country_code": "CA",
                    "country_name": "Canada",
                    "default": true
                }
            ],
            "accepts_marketing_updated_at": "2020-11-04T16:31:01-05:00",
            "marketing_opt_in_level": 'null',
            "tax_exemptions": '[]',
            "admin_graphql_api_id": "gid://shopify/Customer/1073339460",
            "default_address": {
                "id": 1053317292,
                "customer_id": 1073339460,
                "first_name": "Mother",
                "last_name": "Lastnameson",
                "company": '',
                "address1": "123 Oak St",
                "address2": 'null',
                "city": "Ottawa",
                "province": "Ontario",
                "country": "Canada",
                "zip": "123 ABC",
                "phone": "555-1212",
                "name": "Mother Lastnameson",
                "province_code": "ON",
                "country_code": "CA",
                "country_name": "Canada",
                "default": 'true'
            }
        };
        const flatSample = this.flatten(SampleResponse);
        let result: BigIDConnector.Field[] = [];
        for (let index in flatSample) {
            result.push({ fieldName: index, fieldType: typeof (flatSample[index]) })
        }
        return result;
    }

    async getRecordCount(username: string, password: string) {
        const request = await fetch(this.BaseURL + "/admin/api/2020-10/customers/count.json",
            {
                headers: {
                    "X-Shopify-Access-Token": process.env.API_KEY as string
                }
            });

        const data = await request.json();
        return data.count;
    }

    async getRecords(username: string, password: string, Offset?: number, Count?: number, paginationKey?: string) {
        let queryParams = new Array();
        if (Offset) {
            queryParams.push("since=" + Offset);
        }
        if (Count) {
            queryParams.push("limit=" + Count);
        }
        if (paginationKey) {
            queryParams.push("page_info=" + paginationKey)
        }

        const request = await fetch(this.BaseURL + "/admin/api/2020-10/customers.json?" + queryParams.join(","),
            {
                headers: {
                    "X-Shopify-Access-Token": process.env.API_KEY as string
                }
            });

        const data = await request.json();

        let result = [];
        for (let customer of data.customers) {
            let thisCustomer = { id: customer.id, data: new Array() };
            customer = this.flatten(customer);
            for (let prop in customer) {
                thisCustomer.data.push({ fieldName: prop, fieldValue: customer[prop] || "", fieldType: typeof (customer[prop] || "") })
            }
            result.push(thisCustomer);
        }
        return result;
    }

    async getRecord(username: string, password: string, id: string) {
        const request = await fetch(this.BaseURL + "/admin/api/2020-10/customers/" + id + ".json",
            {
                headers: {
                    "X-Shopify-Access-Token": process.env.API_KEY as string
                }
            });
            
        const data = await request.json();
        let customer = this.flatten(data.customer);
        let thisCustomer = { id: customer.id, data: new Array() };
        for (let prop in customer) {
            thisCustomer.data.push({ fieldName: prop, fieldValue: customer[prop] || "", fieldType: typeof (customer[prop] || "") })
        }
        return thisCustomer;
    }

    async searchRecords(username: string, password: string, Offset?: number, Count?: number, paginationKey?: string, fieldName?: string, fieldValue?: string, isFullMatch?: boolean) {
        let queryParams = new Array();
        if (Offset) {
            queryParams.push("since=" + Offset);
        }
        if (Count) {
            queryParams.push("limit=" + Count);
        }
        if (paginationKey) {
            queryParams.push("page_info=" + paginationKey)
        }
        if (fieldValue && fieldName && isFullMatch !== true) {
            queryParams.push("query=" + fieldValue)
        }
        if (fieldValue && fieldName && isFullMatch == true) {
            queryParams.push("query=" + fieldName + ":" + fieldValue)
        }

        const request = await fetch(this.BaseURL + "/admin/api/2020-10/search.json?" + queryParams.join(","),
            {
                headers: {
                    "X-Shopify-Access-Token": process.env.API_KEY as string
                }
            });
        const data = await request.json();

        let result = [];
        for (let customer of data.customers) {
            let thisCustomer = { id: customer.id, data: new Array() };
            customer = this.flatten(customer);
            for (let prop in customer) {
                thisCustomer.data.push({ fieldName: prop, fieldValue: customer[prop] || "", fieldType: typeof (customer[prop] || "") })
            }
            result.push(thisCustomer);
        }
        return result;
    }
}