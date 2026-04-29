import { promisify } from "util";
import fs from 'fs/promises';
import path from 'path';
import { exec } from "child_process";


const asyncExecute = promisify(exec);

async function executeCommand({command}) {
     
    try{
    const {stdout, stderr} = await asyncExecute(command);

    if(stderr){
        return `Error: ${stderr}`
    }

    return `Success: ${stdout} || Task executed completely`

    }
    catch(error){
      
        return `Error: ${error}`
    }
    
}



const executeCommandDeclaration = {
    name: "executeCommand",
    description:"Execute a single terminal/shell command. A command can be to create a folder, file, write on a file, edit the file or delete the file",
    parameters:{
        type:'OBJECT',
        properties:{
            command:{
                type:'STRING',
                description: 'It will be a single terminal command. Ex: "mkdir calculator"'
            },
        },
        required: ['command']   
    }

}


async function writeFile({path:filePath, content}) {
    // try {
    //     await fs.writeFile(path, content);
    //     return `Success: Content written to ${path}`;
    // } catch(error) {
    //     return `Error: ${error.message}`;
    // }

      try {
        console.log(`Writing file: ${filePath}`);
        
        // Ensure directory exists
        const dirPath = path.dirname(filePath);
        await fs.mkdir(dirPath, { recursive: true });
        
        await fs.writeFile(filePath, content);
        console.log(`Successfully wrote to ${filePath}`);
        return `Success: Content written to ${filePath}`;
    } catch(error) {
        console.error(`File write error: ${error.message}`);
        return `Error: ${error.message}`;
    }
}

const writeFileDeclaration = {
    name: "writeFile",
    description: "Write content to a file directly",
    parameters: {
        type: 'OBJECT',
        properties: {
            path: {
                type: 'STRING',
                description: 'Path to the file'
            },
            content: {
                type: 'STRING',
                description: 'Content to write to the file'
            }
        },
        required: ['path', 'content']
    }
};


export { executeCommand, executeCommandDeclaration, writeFile, writeFileDeclaration };