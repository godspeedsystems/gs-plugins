### plugin

## Oracle as a Datasource Plugin 

- Steps to use oracle plug-in in godspeed framework:
- create a godspeed project to test
- setup a oracle docker contaier  using below two commands
```
docker pull gvenzl/oracle-xe
```

```
docker container run -d -p 1521:1521 -e ORACLE_PASSWORD=oracle  --name oracle21 gvenzl/oracle-xe
```

make a file in the godspeed project in the datasource/oracle.yaml and paste below code to the file (credencials).
```
type: oracle
user: system
password: oracle
connectString: localhost:1521/XE
``` 
- **make a file in the datasource/types/oracle.ts and paste the oracle db plugin code in that file**



make a event for oracle db 

```
http.post./oracle:
  summary: Create a new Category
  description: Create Category from database
  fn: helloworld
  body:
    content:
      application/json:
        schema:
          type: object
          properties:
            sql:
              type: string
                  
            
  responses:
    200:
      description: OK
      content:
        application/json:
          schema:
            type: object
```

make a workflow for oracle db 

```
summary: short summary of the workflow
tasks:
  - id: unique_id
    description: detailed description of workflow
    fn: datasource.oracle.execute
    args: <% inputs.body %>

```


- now start the docker (oracle container). 
- run the godspeed project.
- open swagger and add below code to check the plugin 

```
{"sql" : "select * from table_name"}
```

you can check any command to review plugin.

##### Thank You ! 
