
# godspeed-plugin-excel-as-datasource

Welcome to the [Godspeed](https://www.godspeed.systems/) Excel Plugin! 🚀

Excel, the silent powerhouse of data. In its cells, numbers transform into insights, and grids become gateways to knowledge. Seamless, reliable, and endlessly versatile—Excel is not just a datasource; it's a canvas of possibilities waiting to be explored.
A brief description of how to use Kafka plug-in in our godspeed framework as Data Source as Event Source. 

## Steps to use excel plug-in in godspeed framework:

this plugin allows you this below operations
| Method                                         | Description                                                                                                                                                                                                                                                                                                                                                                                                                    |
|----------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| create                               |   send data to excel file                                                                                                                                                                                     |
| update           | update specific row by Id                                                                                 |
|   delete         |     delete specific row by Id                                       |
| one            |get one specific row by Id                       |
|          search      |    get all rows of excel sheet                                  |


### Example usage (create):

1. Update configuration file based on your requirements in `Datasource/excel.yaml`.
#### excel config ( src/datasources/excel.yaml )
```yaml
type: excel
filepath: "/home/laptop/Desktop/test.ods"
```



#### excel event for create new user  ( src/events/excel_event.yaml )
In the event, we establish HTTP endpoint that accepts json objects in request body. When this endpoint is invoked, it triggers the `excel_create` function. This function, in turn, takes the  input arguments and performs the task of creating new objects to the specified excel file.
```yaml
# event for create

http.post./excel:
  summary: Create a new User
  description: Create User from database
  fn: excel_create
  body:
    content:
      application/json:
        schema:
          type: object
  responses:
    content:
      application/json:
        schema:
          type: object


```
#### excel workflow for create a new user ( src/functions/excel_create.yaml )

In workflow we need to mension `datasource.excel.${method}` as function (fn) to perform operations in this case `datasource.excel.create`.

```yaml
summary: Create User
tasks:
  - id: create
    fn: datasource.excel.create
    args:
      data: <% inputs.body %>

```
