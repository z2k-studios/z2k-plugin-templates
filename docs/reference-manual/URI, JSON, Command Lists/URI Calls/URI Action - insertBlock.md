
2. Insert Partial at the end (or start)
    
3. Add a Insert Partial at Header
    
    1. Action that takes a partial template and inserts it at a header location in an existing file
        
    2. `obsidian://z2k-templates?action=InsertBlock&vault=<your-vault>&blockPath=my-partial-template&existingfilepath=existingFilePath&destheader=destination-header&templateJSONdata=myJSONdata`
        
    3. alternative version
        
        1. `obsidian://z2k-templates?action=InsertBlock&vault=<your-vault>&blockPath=my-partial-template&existingFilePath=existing-file-path&destheader=destination-header&field1=field1encodedtext&field2=field2encodedtext`
            
    4. Templatedata fields are optional
        
    5. Consider adding a location= field parameter to specify whether the text is added to the beginning or the end of the header section. Add it to the beginning by default.
        
4. File name from dailies plugin
