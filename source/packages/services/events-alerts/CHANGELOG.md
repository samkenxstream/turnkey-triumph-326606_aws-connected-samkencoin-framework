# Change Log - @cdf/events-alerts

This log was last generated on Mon, 16 May 2022 03:04:28 GMT and should not be manually modified.

## 3.0.2
Mon, 16 May 2022 03:04:28 GMT

### Patches

- re-enable DAX query by event alerts

## 3.0.1
Mon, 21 Mar 2022 21:58:32 GMT

### Patches

- Upgrade dependencies marked as deprecated

## 3.0.0
Thu, 17 Feb 2022 09:27:38 GMT

### Breaking changes

- migrate configuration to use dotenv-flow and deployment to use installer

## 2.0.5
Tue, 28 Dec 2021 18:37:09 GMT

### Patches

- Addressed github security dependabot alerts

## 2.0.4
Tue, 28 Sep 2021 22:04:37 GMT

### Patches

- Replaced references to CDF components being referred to as services to modules to avoid confusion with AWS services.

## 2.0.3
Wed, 11 Aug 2021 01:26:49 GMT

### Patches

- opensource related minor changes
- missing KMS Key Id needed to decrypt the KMS protected DynamoDB stream

## 3.2.0
Thu, 29 Jul 2021 00:16:37 GMT

### Minor changes

- adding middleware for express based services to remove path from request url to handle custom domain

### Patches

- Added missing permission required to remove lambda invoke permission when deleting an iotcore event source.

## 3.1.4
Wed, 21 Jul 2021 16:46:57 GMT

### Patches

- The generated lambda bundle size has been reduced.

