# godspeed-plugin-salesforce-as-datasource

This plugin utilizes the Jsforce Liberary to provide you with simple CRUD operations and Query functionality using SOQL.

## Steps to use aws plug-in in godspeed framework:

Add Plugin using the GodSpeed CLI

## Example usage (Create):

1. Update config file based on your credentials in Datasource/salesforce/aws.yaml

salesforce config ( src/datasources/salesforce.yaml )

```yaml
type: salesforce
username: <% Your username %>
password: <% Your password %>
security_token: <% Your security token %>
loginurl: <% Your login usl sandbox or login %>
```

2. In the event, we establish HTTP endpoint that accepts json objects in request body. When this endpoint is invoked, it triggers the salesforce_create function. This function, ingests one document, takes the input arguments and performs the task of creating new objects to the specified 'sobject'.

salesforce event for create Objects ( src/events/salesforce_create.yaml )

```yaml
"http.post./salesforce/create":
  fn: salesforce_create
  body:
    type: object
  responses:
    200:
      application/json:
```

3. In workflow we need to mension datasource.salesforce.${method} as function (fn) to perform operations in this case datasource.salesforce.create.

salesforce funtion for create Objects ( src/function/salesforce_create.yaml )

```yaml
id: salesforce
tasks:
  - id: create
    fn: datasource.salesforce.create
    args:
      sobject: <% Your sobject name %>
      params:
        Name: <% inputs.body.params %>
```

## Plugin Commands (Operations List)

<p>
<details>
<summary>Create</summary>

```yaml
id: salesforce
tasks:
  - id: create
    fn: datasource.salesforce.create
    args:
      sobject: "Account"
      params:
        Name: "Sahil Account New"
```

[Offical Jsforce Create Documentation](https://jsforce.github.io/document/#create)

</details>

<details>
<summary>Retrieve</summary>

```yaml
id: salesforce
tasks:
  - id: create
    fn: datasource.salesforce.retrieve
    args:
      sobject: "Account"
      params:
        Id: "0015j00001CkzV9AAJ"
```

[Offical Jsforce Retrieve Documentation](https://jsforce.github.io/document/#retrieve)

</details>
<details>
<summary>Update</summary>

```yaml
id: salesforce
tasks:
  - id: create
    fn: datasource.salesforce.update
    args:
      sobject: "Account"
      params:
        Id: "0015j00001CkzV9AAJ"
        Name: "Sahil Account Update"
```

[Offical Jsforce Update Documentation](https://jsforce.github.io/document/#update)

</details>
<details>
<summary>Delete</summary>

```yaml
id: salesforce
tasks:
  - id: create
    fn: datasource.salesforce.delete
    args:
      sobject: "Account"
      params:
        Id: "0015j00001CkzV9AAJ"
```

[Offical Jsforce Delete Documentation](https://jsforce.github.io/document/#delete)

</details>

<details>
<summary>Query</summary>

```yaml
id: salesforce
tasks:
  - id: create
    fn: datasource.salesforce.query
    args:
      params:
        Query: "SELECT Id, Name FROM Account"
```

[Offical Jsforce Query Documentation](https://jsforce.github.io/document/#query)

</details>
</p>
