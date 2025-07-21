The templating function is performed with an optional JSON package provided externally (for instance, programmatically through a URI call.) In this instance, the templating routine will use the information from the JSON package as data input first before prompting the user for the data. 

The structure of the JSON package follows the standard JSON Schema design, with a few additions:

==still to be done and documented==
*Note: may wish to include a field for specifying whether or not the user should be prompted for the remaining fields, all the fields, or none at all.* 


# Dev Notes

Background:

See [https://github.com/Vinzent03/obsidian-advanced-uri](https://github.com/Vinzent03/obsidian-advanced-uri) for implementation details and guidance on interface.

Features

1. Underlying command structure
    
    1. Follow Advanced URI plugin ([https://publish.obsidian.md/advanced-uri-doc/Actions/Writing](https://publish.obsidian.md/advanced-uri-doc/Actions/Writing) )
        
    
2. Add a NewCard command.
    
    1. Simple action that takes a vault, and a template file, and creates a new file with the template
        
    2. obsidian://z2k-templates?action=New&vault=<your-vault>&templatepath=my-template&filepath=new-file-name
        
    3. If filepath is missing a path, it will use the template’s path to determine the location, and failing that will place it in the root path. If file path is missing a filename, then it will use a millisecond timestamp for the file.
        
3. Add a NewCard + data command
    
    1. Action that takes a vault, and a template file, and creates a new file with the template. Note: filepath
        
    2. obsidian://z2k-templates?action=New&vault=<your-vault>&templatepath=my-template&filepath=new-file-name&templateJSONdata=myJSONdata
        
    3. alternative version that skips JSON and just has the field names on the URI
        
        1. obsidian://z2k-templates?action=New&vault=<your-vault>&templatepath=my-template&filepath=new-file-name&field1=field1encodedtext&field2=field2encodedtext
            
    4. If filepath is missing a path, it will use the template’s path to determine the location, and failing that will place it in the root path. If file path is missing a filename, then it will FIRST try to use the JSON data to construct the default filename. Failing that it will use a millisecond timestamp for the filename
        
4. Insert Partial at the end (or start)
    
5. Add a Insert Partial at Header
    
    1. Action that takes a partial template and inserts it at a header location in an existing file
        
    2. obsidian://z2k-templates?action=InsertPartial&vault=<your-vault>&partialpath=my-partial-template&existingfilepath=existing-file-path&destheader=destination-header&templateJSONdata=myJSONdata
        
    3. alternative version
        
        1. obsidian://z2k-templates?action=InsertPartial&vault=<your-vault>&partialpath=my-partial-template&existingfilepath=existing-file-path&destheader=destination-header&field1=field1encodedtext&field2=field2encodedtext
            
    4. Templatedata fields are optional
        
    5. Consider adding a location= field parameter to specify whether the text is added to the beginning or the end of the header section. Add it to the beginning by default.
        
6. File name from dailies plugin


PS - add support for {{sourceText}}  field for additional text, particularly for JSON packets.
