2. Add a New File command.
    
    1. Simple action that takes a vault, and a template file, and creates a new file with the template
        
    2. `obsidian://z2k-templates?action=New&vault=<your-vault>&templatepath=my-template&filepath=new-file-name`
        
    3. If filepath is missing a path, it will use the template’s path to determine the location, and failing that will place it in the root path. If file path is missing a filename, then it will use a millisecond timestamp for the file.
        
3. Add a New File + data command
    
    1. Action that takes a vault, and a template file, and creates a new file with the template. Note: filepath
        
    2. `obsidian://z2k-templates?action=New&vault=<your-vault>&templatepath=my-template&filepath=new-file-name&templateJSONdata=myJSONdata`
        
    3. alternative version that skips JSON and just has the field names on the URI
        
        1. `obsidian://z2k-templates?action=New&vault=<your-vault>&templatepath=my-template&filepath=new-file-name&field1=field1encodedtext&field2=field2encodedtext`
            
    4. If filepath is missing a path, it will use the template’s path to determine the location, and failing that will place it in the root path. If file path is missing a filename, then it will FIRST try to use the JSON data to construct the default filename. Failing that it will use a millisecond timestamp for the filename
        
