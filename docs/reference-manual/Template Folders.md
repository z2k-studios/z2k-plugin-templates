---
sidebar_position: 10
---
All Templates used by the Z2K Templates Plugin must be saved in a Templates folder. There are two ways to configure your template folders:

1. [[#External Template Folders]], or
2. [[#Embedded Template Folders]]

See the [[Plugin Settings Page]] for how to configure which method you are using.


# Template Folder Methods
## External Template Folders
When you have configured the plugin to use External Template Folders, you have requested the plugin to search for templates inside a separate folder in the root of your vault, by default `/Templates`.

For instance, here is how a vault might look for an external template folder configuration:

```text
#todo 
```

#ToDo: does it support a hierarchy in the external Template Folders

## Embedded Template Folders
If you elect to use embedded template folders, then the Templates folder is located in each folder within your vault, This allows you to hierarchically group different template types so that they are only visible while within a specific folder.

For instance, here is how a vault might look for an embedded template folder configuration:

```text
#todo 
```


# Template Searching
The Z2K Templates Plugin attempts to be smart about how it finds what Templates are available given the current context. 