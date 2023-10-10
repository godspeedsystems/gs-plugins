
# godspeed-plugin-aws-as-datasource

Welcome to the backbone of the cloud—the Amazon Web Services (AWS). Renowned for its unparalleled scalability and reliability, AWS stands as a juggernaut in cloud computing. Empowering businesses with a vast array of services, from storage to machine learning, AWS is the conduit for innovation in the digital realm. Dive into the future of computing with AWS as your steadfast and cutting-edge data source.

A brief description of how to use aws plug-in in our godspeed framework as Data Source as Event Source. 

## Steps to use aws plug-in in godspeed framework:


Add plugin using CLI 

### Example usage (listObjects):

1. Update configuration file based on your requirements in `Datasource/aws.yaml`.
#### aws config ( src/datasources/aws.yaml )
```yaml
type: aws
region: "ap-south-1"
bucket_name: "godspeed-test"
accessKeyId: "AKIC4KQJJFGY3NDQ2TPY"
secretAccessKey: "lXxTDaVZyv+dwMn2PepJ9gyd1IotfX/voBmggu6E"


```



#### aws event for list Objects  ( src/events/aws_event.yaml )
In the event, we establish HTTP endpoint that accepts json objects in request body. When this endpoint is invoked, it triggers the `aws_list` function. This function, in turn, takes the  input arguments and performs the task of creating new objects to the specified aws file.
```yaml
# event for create

"http.post./aws":
  fn: aws_list
  body:
    type: object
  responses:
    200:
      content:
         application/json:

```
#### aws workflow for create a new user ( src/functions/aws_list.yaml )

In workflow we need to mension `datasource.aws.${method}` as function (fn) to perform operations in this case `datasource.aws.listObjects`.

```yaml
id: aws
tasks:
  - id: aws_list
    fn: datasource.aws.listObjects
    args:
      params: <% inputs.body.params %>

```

## Plugin Commands (Operations List)

<details>
<summary>
AbortMultipartUpload


</summary>
required params

   - Bucket
   - Key
   - UploadId

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/abortmultipartuploadcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/abortmultipartuploadcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/abortmultipartuploadcommandoutput.html)

</details>
<details>
<summary>
CompleteMultipartUpload
</summary>

required params

   - Bucket
   - Key
   - MultipartUpload
     - Parts

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/completemultipartuploadcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/completemultipartuploadcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/completemultipartuploadcommandoutput.html)

</details>
<details>
<summary>
CopyObject
</summary>

required params

   - Bucket
   - CopySource
   - Key

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/copyobjectcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/copyobjectcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/copyobjectcommandoutput.html)

</details>
<details>
<summary>
CreateBucket
</summary>
required params

   - Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/createbucketcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/createbucketcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/createbucketcommandoutput.html)

</details>
<details>
<summary>
CreateMultipartUpload
</summary>
required params

   - Bucket
   - Key

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/createmultipartuploadcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/createmultipartuploadcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/createmultipartuploadcommandoutput.html)

</details>
<details>
<summary>
DeleteBucket
</summary>

required params

   - Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/deletebucketcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketcommandoutput.html)

</details>
<details>
<summary>
DeleteBucketAnalyticsConfiguration
</summary>
required params

   - Bucket
   - Id

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/deletebucketanalyticsconfigurationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketanalyticsconfigurationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketanalyticsconfigurationcommandoutput.html)

</details>
<details>
<summary>
DeleteBucketCors
</summary>

required params

   - Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/deletebucketcorscommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketcorscommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketcorscommandoutput.html)

</details>
<details>
<summary>
DeleteBucketEncryption
</summary>


required params

   - Bucket


[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/deletebucketencryptioncommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketencryptioncommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketencryptioncommandoutput.html)

</details>
<details>
<summary>
DeleteBucketIntelligentTieringConfiguration
</summary>
required params

   - Bucket
   - Id

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/deletebucketintelligenttieringconfigurationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketintelligenttieringconfigurationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketintelligenttieringconfigurationcommandoutput.html)

</details>
<details>
<summary>
DeleteBucketInventoryConfiguration
</summary>
required params

   - Bucket
   - Id

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/deletebucketinventoryconfigurationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketinventoryconfigurationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketinventoryconfigurationcommandoutput.html)

</details>
<details>
<summary>
DeleteBucketLifecycle
</summary>
required params

   - Bucket


[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/deletebucketlifecyclecommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketlifecyclecommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketlifecyclecommandoutput.html)

</details>
<details>
<summary>
DeleteBucketMetricsConfiguration
</summary>
required params

   - Bucket
   - Id

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/deletebucketmetricsconfigurationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketmetricsconfigurationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketmetricsconfigurationcommandoutput.html)

</details>
<details>
<summary>
DeleteBucketOwnershipControls
</summary>
required params

   - Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/deletebucketownershipcontrolscommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketownershipcontrolscommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketownershipcontrolscommandoutput.html)

</details>
<details>
<summary>
DeleteBucketPolicy
</summary>
required params

   - Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/deletebucketpolicycommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketpolicycommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketpolicycommandoutput.html)

</details>
<details>
<summary>
DeleteBucketReplication
</summary>
required params

   - Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/deletebucketreplicationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketreplicationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketreplicationcommandoutput.html)

</details>
<details>
<summary>
DeleteBucketTagging
</summary>
required params

   - Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/deletebuckettaggingcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebuckettaggingcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebuckettaggingcommandoutput.html)

</details>
<details>
<summary>
DeleteBucketWebsite
</summary>
required params

   - Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/deletebucketwebsitecommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketwebsitecommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketwebsitecommandoutput.html)

</details>
<details>
<summary>
DeleteObject
</summary>

required params

- Bucket
- Key

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/deleteobjectcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deleteobjectcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deleteobjectcommandoutput.html)

</details>
<details>
<summary>
DeleteObjects
</summary>

require params

  - Bucket
  - Delete
      - Objects
      
[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/deleteobjectscommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deleteobjectscommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deleteobjectscommandoutput.html)

</details>
<details>
<summary>
DeleteObjectTagging
</summary>

required params

- Bucket
- Key

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/deleteobjecttaggingcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deleteobjecttaggingcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deleteobjecttaggingcommandoutput.html)

</details>
<details>
<summary>
DeletePublicAccessBlock
</summary>
required params

   - Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/deletepublicaccessblockcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletepublicaccessblockcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletepublicaccessblockcommandoutput.html)

</details>
<details>
<summary>
GetBucketAccelerateConfiguration
</summary>
required params

   - Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getbucketaccelerateconfigurationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketaccelerateconfigurationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketaccelerateconfigurationcommandoutput.html)

</details>
<details>
<summary>
GetBucketAcl
</summary>
required params

   - Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getbucketaclcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketaclcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketaclcommandoutput.html)

</details>
<details>
<summary>
GetBucketAnalyticsConfiguration
</summary>

required params

- Bucket
- Id

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getbucketanalyticsconfigurationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketanalyticsconfigurationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketanalyticsconfigurationcommandoutput.html)

</details>
<details>
<summary>
GetBucketCors
</summary>
required params

   - Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getbucketcorscommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketcorscommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketcorscommandoutput.html)

</details>
<details>
<summary>
GetBucketEncryption
</summary>
required params

   - Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getbucketencryptioncommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketencryptioncommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketencryptioncommandoutput.html)

</details>
<details>
<summary>
GetBucketIntelligentTieringConfiguration
</summary>

required params

- Bucket
- Id

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getbucketintelligenttieringconfigurationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketintelligenttieringconfigurationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketintelligenttieringconfigurationcommandoutput.html)

</details>
<details>
<summary>
GetBucketInventoryConfiguration
</summary>
required params

- Bucket
- Key

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getbucketinventoryconfigurationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketinventoryconfigurationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketinventoryconfigurationcommandoutput.html)

</details>
<details>
<summary>
GetBucketLifecycleConfiguration
</summary>

required params

- Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getbucketlifecycleconfigurationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketlifecycleconfigurationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketlifecycleconfigurationcommandoutput.html)

</details>
<details>
<summary>
GetBucketLocation
</summary>
required params

- Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getbucketlocationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketlocationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketlocationcommandoutput.html)

</details>
<details>
<summary>
GetBucketLogging
</summary>
required params

- Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getbucketloggingcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketloggingcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketloggingcommandoutput.html)

</details>
<details>
<summary>
GetBucketMetricsConfiguration
</summary>
required params

- Bucket
- Id

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getbucketmetricsconfigurationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketmetricsconfigurationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketmetricsconfigurationcommandoutput.html)

</details>
<details>
<summary>
GetBucketNotificationConfiguration
</summary>
required params

- Bucket
 
[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getbucketnotificationconfigurationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketnotificationconfigurationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketnotificationconfigurationcommandoutput.html)

</details>
<details>
<summary>
GetBucketOwnershipControls
</summary>
required params

- Bucket
 
[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getbucketownershipcontrolscommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketownershipcontrolscommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketownershipcontrolscommandoutput.html)

</details>
<details>
<summary>
GetBucketPolicy
</summary>
required params

- Bucket
 
[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getbucketpolicycommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketpolicycommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketpolicycommandoutput.html)

</details>
<details>
<summary>
GetBucketPolicyStatus
</summary>
required params

- Bucket
 
[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getbucketpolicystatuscommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketpolicystatuscommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketpolicystatuscommandoutput.html)

</details>
<details>
<summary>
GetBucketReplication
</summary>
required params

- Bucket
 
[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getbucketreplicationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketreplicationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketreplicationcommandoutput.html)

</details>
<details>
<summary>
GetBucketRequestPayment
</summary>
required params

- Bucket
 
[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getbucketrequestpaymentcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketrequestpaymentcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketrequestpaymentcommandoutput.html)

</details>
<details>
<summary>
GetBucketTagging
</summary>
required params

- Bucket
 
[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getbuckettaggingcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbuckettaggingcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbuckettaggingcommandoutput.html)

</details>
<details>
<summary>
GetBucketVersioning
</summary>
required params

- Bucket
 
[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getbucketversioningcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketversioningcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketversioningcommandoutput.html)

</details>
<details>
<summary>
GetBucketWebsite
</summary>
required params

- Bucket
 
[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getbucketwebsitecommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketwebsitecommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getbucketwebsitecommandoutput.html)

</details>
<details>
<summary>
GetObject
</summary>
required params

   - Bucket
   - key

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getobjectcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getobjectcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getobjectcommandoutput.html)

</details>
<details>
<summary>
GetObjectAcl
</summary>
required params

   - Bucket
   - key

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getobjectaclcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getobjectaclcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getobjectaclcommandoutput.html)

</details>
<details>
<summary>
GetObjectAttributes
</summary>
required params

   - Bucket
   - key

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getobjectattributescommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getobjectattributescommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getobjectattributescommandoutput.html)

</details>
<details>
<summary>
GetObjectLegalHold
</summary>
required params

   - Bucket
   - key

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getobjectlegalholdcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getobjectlegalholdcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getobjectlegalholdcommandoutput.html)

</details>
<details>
<summary>
GetObjectLockConfiguration
</summary>
required params

   - Bucket
   - key

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getobjectlockconfigurationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getobjectlockconfigurationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getobjectlockconfigurationcommandoutput.html)

</details>
<details>
<summary>
GetObjectRetention
</summary>
required params

   - Bucket
   - key

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getobjectretentioncommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getobjectretentioncommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getobjectretentioncommandoutput.html)

</details>
<details>
<summary>
GetObjectTagging
</summary>
required params

   - Bucket
   - key

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getobjecttaggingcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getobjecttaggingcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getobjecttaggingcommandoutput.html)

</details>
<details>
<summary>
GetObjectTorrent
</summary>
required params

   - Bucket
   - key

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getobjecttorrentcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getobjecttorrentcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getobjecttorrentcommandoutput.html)

</details>
<details>
<summary>
GetPublicAccessBlock
</summary>
required params

   - Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getpublicaccessblockcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getpublicaccessblockcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/getpublicaccessblockcommandoutput.html)

</details>
<details>
<summary>
HeadBucket
</summary>
required params

   - Bucket


[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/headbucketcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/headbucketcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/headbucketcommandoutput.html)

</details>
<details>
<summary>
HeadObject
</summary>
required params

   - Bucket


[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/headobjectcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/headobjectcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/headobjectcommandoutput.html)

</details>
<details>
<summary>
ListBucketAnalyticsConfigurations
</summary>
required params

   - Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/listbucketanalyticsconfigurationscommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listbucketanalyticsconfigurationscommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listbucketanalyticsconfigurationscommandoutput.html)

</details>
<details>
<summary>
ListBucketIntelligentTieringConfigurations
</summary>
required params

   - Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/listbucketintelligenttieringconfigurationscommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listbucketintelligenttieringconfigurationscommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listbucketintelligenttieringconfigurationscommandoutput.html)

</details>
<details>
<summary>
ListBucketInventoryConfigurations
</summary>
required params

   - Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/listbucketinventoryconfigurationscommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listbucketinventoryconfigurationscommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listbucketinventoryconfigurationscommandoutput.html)

</details>
<details>
<summary>
ListBucketMetricsConfigurations
</summary>
required params

   - Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/listbucketmetricsconfigurationscommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listbucketmetricsconfigurationscommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listbucketmetricsconfigurationscommandoutput.html)

</details>
<details>
<summary>
ListBuckets
</summary>

required
- (No specific parameters)

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/listbucketscommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listbucketscommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listbucketscommandoutput.html)

</details>
<details>
<summary>
ListMultipartUploads
</summary>
required params

   - Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/listmultipartuploadscommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listmultipartuploadscommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listmultipartuploadscommandoutput.html)

</details>
<details>
<summary>
ListObjects
</summary>
required params

   - Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/listobjectscommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listobjectscommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listobjectscommandoutput.html)

</details>
<details>
<summary>
ListObjectsV2
</summary>
required params

   - Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/listobjectsv2command.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listobjectsv2commandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listobjectsv2commandoutput.html)

</details>
<details>
<summary>
ListObjectVersions
</summary>
required params

   - Bucket

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/listobjectversionscommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listobjectversionscommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listobjectversionscommandoutput.html)

</details>
<details>
<summary>
ListParts
</summary>

required params

- Bucket
- Key
- UploadId

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/listpartscommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listpartscommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listpartscommandoutput.html)

</details>
<details>
<summary>
PutBucketAccelerateConfiguration
</summary>

required params

- Bucket
- AccelerateConfiguration
    - Status

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putbucketaccelerateconfigurationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketaccelerateconfigurationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketaccelerateconfigurationcommandoutput.html)

</details>
<details>
<summary>
PutBucketAcl
</summary>

required params

- Bucket
- AccessControlPolicy
    - Grants
    - Owner

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putbucketaclcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketaclcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketaclcommandoutput.html)

</details>
<details>
<summary>
PutBucketAnalyticsConfiguration
</summary>
required params

- Bucket
- Id
- AnalyticsConfiguration
    - StorageClassAnalysis


[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putbucketanalyticsconfigurationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketanalyticsconfigurationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketanalyticsconfigurationcommandoutput.html)

</details>
<details>
<summary>
PutBucketCors
</summary>
required params

- Bucket
- CORSConfiguration
    - CORSRules

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putbucketcorscommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketcorscommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketcorscommandoutput.html)

</details>
<details>
<summary>
PutBucketEncryption
</summary>

required params 

- Bucket
- ServerSideEncryptionConfiguration
    - Rules

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putbucketencryptioncommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketencryptioncommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketencryptioncommandoutput.html)

</details>
<details>
<summary>
PutBucketIntelligentTieringConfiguration
</summary>
required params

- Bucket
- IntelligentTieringId
- IntelligentTieringConfiguration
    - Status
    - Tierings
    - Days
    - AccessTier

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putbucketintelligenttieringconfigurationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketintelligenttieringconfigurationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketintelligenttieringconfigurationcommandoutput.html)

</details>
<details>
<summary>
PutBucketInventoryConfiguration
</summary>

required params

- Bucket
- Id
- InventoryConfiguration
    - Destination
    - IsEnabled
    - Id
    - IncludedObjectVersions
    - Schedule
    - OptionalFields

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putbucketinventoryconfigurationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketinventoryconfigurationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketinventoryconfigurationcommandoutput.html)

</details>
<details>
<summary>
PutBucketLifecycleConfiguration
</summary>

required params

- Bucket
- LifecycleConfiguration
    - Rules

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putbucketlifecycleconfigurationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketlifecycleconfigurationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketlifecycleconfigurationcommandoutput.html)

</details>
<details>
<summary>
PutBucketLogging
</summary>
required params

- Bucket
- BucketLoggingStatus
    - LoggingEnabled
    - TargetBucket
    - TargetPrefix

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putbucketloggingcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketloggingcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketloggingcommandoutput.html)

</details>
<details>
<summary>
PutBucketMetricsConfiguration
</summary>
required params

- Bucket
- Id
- MetricsConfiguration
    - Id
    - Filter
    - StorageClassAnalysis

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putbucketmetricsconfigurationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketmetricsconfigurationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketmetricsconfigurationcommandoutput.html)

</details>
<details>
<summary>
PutBucketNotificationConfiguration
</summary>

required params

- Bucket
- NotificationConfiguration
    - LambdaFunctionConfigurations
    - QueueConfigurations
    - TopicConfigurations

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putbucketnotificationconfigurationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketnotificationconfigurationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketnotificationconfigurationcommandoutput.html)

</details>
<details>
<summary>
PutBucketOwnershipControls
</summary>

requiredparams

- Bucket
- OwnershipControls
    - Rules

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putbucketownershipcontrolscommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketownershipcontrolscommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketownershipcontrolscommandoutput.html)

</details>
<details>
<summary>
PutBucketPolicy
</summary>

required params

- Bucket
- Policy

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putbucketpolicycommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketpolicycommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketpolicycommandoutput.html)

</details>
<details>
<summary>
PutBucketReplication
</summary>
required params

- Bucket
- ReplicationConfiguration
    - Role
    - Rules


[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putbucketreplicationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketreplicationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketreplicationcommandoutput.html)

</details>
<details>
<summary>
PutBucketRequestPayment
</summary>

required params

- Bucket
- RequestPaymentConfiguration
    - Payer

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putbucketrequestpaymentcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketrequestpaymentcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketrequestpaymentcommandoutput.html)

</details>
<details>
<summary>
PutBucketTagging
</summary>

required params 

- Bucket
- Tagging

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putbuckettaggingcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbuckettaggingcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbuckettaggingcommandoutput.html)

</details>
<details>
<summary>
PutBucketVersioning
</summary>

required params

- Bucket
- VersioningConfiguration
    - Status

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putbucketversioningcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketversioningcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketversioningcommandoutput.html)

</details>
<details>
<summary>
PutBucketWebsite
</summary>

required params

- Bucket
- WebsiteConfiguration
    - ErrorDocument
    - IndexDocument
    - RedirectAllRequestsTo
    - RoutingRules

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putbucketwebsitecommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketwebsitecommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putbucketwebsitecommandoutput.html)

</details>
<details>
<summary>
PutObject
</summary>

required params

- Bucket
- Key
- Body

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putobjectcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putobjectcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putobjectcommandoutput.html)

</details>
<details>
<summary>
PutObjectAcl
</summary>

required params
- Bucket
- Key
- AccessControlPolicy
    - Grants
    - Owner

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putobjectaclcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putobjectaclcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putobjectaclcommandoutput.html)

</details>
<details>
<summary>
PutObjectLegalHold
</summary>
required params

- Bucket
- Key
- LegalHold
    - Status

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putobjectlegalholdcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putobjectlegalholdcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putobjectlegalholdcommandoutput.html)

</details>
<details>
<summary>
PutObjectLockConfiguration
</summary>
required params

- Bucket
- Key
- ObjectLockConfiguration
    - ObjectLockEnabled
    - Rule

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putobjectlockconfigurationcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putobjectlockconfigurationcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putobjectlockconfigurationcommandoutput.html)

</details>
<details>
<summary>
PutObjectRetention
</summary>
required params

- Bucket
- Key
- Retention
    - Mode
    - RetainUntilDate

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putobjectretentioncommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putobjectretentioncommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putobjectretentioncommandoutput.html)

</details>
<details>
<summary>
PutObjectTagging
</summary>
required params

- Bucket
- Key
- Tagging

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putobjecttaggingcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putobjecttaggingcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putobjecttaggingcommandoutput.html)

</details>
<details>
<summary>
PutPublicAccessBlock
</summary>
required params

- Bucket
- PublicAccessBlockConfiguration
    - BlockPublicAcls
    - BlockPublicPolicy
    - IgnorePublicAcls
    - RestrictPublicBuckets

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putpublicaccessblockcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putpublicaccessblockcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putpublicaccessblockcommandoutput.html)

</details>
<details>
<summary>
RestoreObject
</summary>
required params

- Bucket
- Key
- RestoreRequest
    - Days

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/restoreobjectcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/restoreobjectcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/restoreobjectcommandoutput.html)

</details>
<details>
<summary>
SelectObjectContent
</summary>
required params

- Bucket
- Key
- Expression
- ExpressionType
- InputSerialization
- OutputSerialization

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/selectobjectcontentcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/selectobjectcontentcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/selectobjectcontentcommandoutput.html)

</details>
<details>
<summary>
UploadPart
</summary>

required params

- Bucket
- Key
- PartNumber
- UploadId
- Body

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/uploadpartcommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/uploadpartcommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/uploadpartcommandoutput.html)

</details>
<details>
<summary>
UploadPartCopy
</summary>

required params

    - Bucket
    - CopySource
    - CopySourceIfMatch
    - CopySourceIfModifiedSince
    - CopySourceIfNoneMatch
    - CopySourceIfUnmodifiedSince
    - CopySourceRange
    - Key
    - PartNumber
    - UploadId

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/uploadpartcopycommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/uploadpartcopycommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/uploadpartcopycommandoutput.html)

</details>
<details>
<summary>
WriteGetObjectResponse
</summary>
required params

- Bucket
- Key
- RequestRoute
- RequestToken
- StatusCode
- ResponseParameters
- ResponseHeaders
- ResponseBody
- PresignedUrl

[Command API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/writegetobjectresponsecommand.html) / [Input](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/writegetobjectresponsecommandinput.html) / [Output](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/writegetobjectresponsecommandoutput.html)

</details>

