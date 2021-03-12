@allowed([
  'Premium_LRS'
  'Standard_GRS'
  'Standard_LRS'
  'Standard_RAGRS'
  'Standard_ZRS'
])
@description('Type of redundancy for your storage account')
param storageAccountType string = 'Standard_GRS'

var storageAccountName_var = 'bicepteststorage'

resource storageAccountName 'Microsoft.Storage/storageAccounts@2016-01-01' = {
  name: storageAccountName_var
  location: resourceGroup().location
  sku: {
    name: storageAccountType
  }
  kind: 'Storage'
}