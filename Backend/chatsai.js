import { GoogleGenAI } from "@google/genai";
import os from "os";
import fs from "fs";
import path from "path";
const platform = os.platform();
import { executeCommand, executeCommandDeclaration, writeFile, writeFileDeclaration,} from "./AiTools/tools.js";
import {
  isOllamaRunning,
  getOllamaPlan
} from "./ollamaservice.js";

const makeWebsite = async (req, res) => {
  try {
    const { messages } = req.body;

    const History = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    console.log("hi i started");
    let useOllama = false;
    let plan = "";
    const ollamaStatus = await isOllamaRunning();

    if (ollamaStatus) {
      const generatedPlan = await getOllamaPlan(messages);

      if (generatedPlan) {
          useOllama = true;
          plan = generatedPlan;
          console.log("Ollama detected.");
          console.log(plan);
        } else {
          useOllama = false;
          console.log("Ollama failed to generate plan. Fallback.");
        }
      } else {
      useOllama = false;
      console.log("Ollama not found. Gemini full control mode.");
    }


    const ai = new GoogleGenAI({apiKey: "AIzaSyBUaFNyxN7z1ux5DMxckIw8CPQ9prffEL8",});

    const availableTools = {
      executeCommand,
      writeFile,
    };

    let finalText;

    while (true) {
      /* `You are an expert AI agent specializing in automated frontend web development. Your goal is to build a complete, functional frontend for a website based on the user's request.
                         And make a attractive UI for the website and choose attractive color combination,and also used some animation.Work in deep with ui and the functionality of the website as user want.You operate by executing terminal commands one at a time using the 'executeCommand' tool.

           Your user's operating system is: ${platform}
           Give command to the user according to its operating system support.

           <-- What is your job -->
        1: Analyse the user query to see what type of website the want to build
        2: Give them command one by one , step by step
        3: Use available tool executeCommand

        // Now you can give them command in following below
        1: First create a folder, Ex: mkdir "calulator"
        2: Inside the folder, create index.html , Ex: touch "calculator/index.html"
        3: Then create style.css same as above
        4: Then create script.js
        5: Then write a code in html file

        You have to provide the terminal or shell command to user, they will directly execute it

          <-- Core Mission: The PLAN -> EXECUTE -> VALIDATE -> REPEAT loop -->
           You must follow this workflow for every task:
           1.  **PLAN**: Decide on the single, next logical command to execute.
           2.  **EXECUTE**: Call the 'executeCommand' tool with that single command.
           3.  **VALIDATE**: Carefully examine the result from the tool. The result will start with "Success:" or "Error:".
            - If "Success:", check the output (stdout) to confirm the command did what you expected. For example, after creating a file, you should list the directory contents. After writing to a file, you should read it back to confirm the content is correct.
            - If "Error:", analyze the error message and formulate a new command to fix the problem. Do not give up on the first error.
           4.  **REPEAT**: Continue this loop until the user's request is fully completed.

          <-- CRITICAL RULES for Writing to Files -->
           This is the most important section. You MUST follow these platform-specific rules to avoid errors.

            **IF the OS is Linux or macOS ('linux' or 'darwin'):**
           - To write multi-line code to a file, YOU MUST use the 'cat' command with a 'here-document'.
            - YOU MUST use single quotes around 'EOF' to prevent shell expansion of characters like '$'.
              - **Correct Example:**
               cat << 'EOF' > my-project/index.html
                 <!DOCTYPE html>
                  <html>
                  <head>
                  <title>My App</title>
                  </head>
                      <body>
                          <h1>Hello World</h1>
                      </body>
                  </html>
                 EOF

           **IF the OS is Windows ('win32'):**
           - To write multi-line code to a file, YOU MUST use **PowerShell's 'Set-Content' cmdlet with a here-string (@'...'@)**. This is the most reliable method.
           - The syntax is: \`@' ... multiline content here ... '@ | Set-Content -Path "path\\to\\file.js"\`
          - **WHY THIS IS SUPERIOR:** You do **NOT** need to escape special HTML/JS characters like '<', '>', '&', etc., inside the here-string block. This avoids many common errors.
            - **Correct Example for writing a JS file:**
              @'
                 const calculator = {
                    displayValue: '0',
                    firstOperand: null,
                    waitingForSecondOperand: false,
                         operator: null,
                  };

              function updateDisplay() {
              const display = document.querySelector('.calculator-screen');
              display.value = calculator.displayValue;
             }
               updateDisplay();
              '@ | Set-Content -Path "my-app\\script.js"

              - **Note on Paths:** Use backslashes \`\\\` for paths in Windows commands.

             **ABSOLUTE RULE:** Do not use a single \`echo "long string of code..." > file.html\` command for writing complex files. It is unreliable. Always use the specific multi-line methods described above for each OS.


           <-- CRITICAL RULES for Writing to Files -->
             For writing files with complex content, always use the dedicated 'writeFile' tool instead of shell commands.
             Example:
             writeFile({path:"project-name/index.html"}",
             content: "<!DOCTYPE html>\\n<html>...</html>"})

             This is much more reliable than using shell commands for file writing.

            <-----Remeber these points------>
             1.If user want to some changes after you create a file, you can use the 'writeFile' tool to modify the files content and remember no need to create a new file or folder.
             2.new folder or project, only create when user want to create a new project or folder and user request for new project or website.

            <-- Final Step -->
                             Once all files are created or modified and validated, your final response MUST be a plain text message to the user, summarizing what you did. Do not call any more tools at this point.`, */
      const systemprompt = useOllama
        ? `You are an expert AI frontend automation agent.

        Ollama already created master plan.

        MASTER PLAN:
        ${plan}

        Use that plan and execute using tools.

        1. Follow plan intelligently
        2. Call executeCommand one step at a time
        3. Call writeFile for code generation
        4. Validate outputs after every step
        5. Fix errors automatically
        6. Modify existing files if user requests changes
        7. Continue until website is complete

        Design Rules:
        - Attractive UI
        - Clean layout
        - Good color combinations
        - Smooth animations
        - Responsive design
        - Functional code

        
        Your user's operating system is: ${platform}
        Give command to the user according to its operating system support.
        // Now you can give them command in following below
        1: First create a folder, Ex: mkdir "calulator"
        2: Inside the folder, create index.html , Ex: touch "calculator/index.html"
        3: Then create style.css same as above
        4: Then create script.js
        5: Then write a code in html file, then in style.css and then in script.js.

        Workflow:
        PLAN NEXT STEP
        EXECUTE
        VALIDATE
        REPEAT
        <-- Core Mission: The PLAN -> EXECUTE -> VALIDATE -> REPEAT loop -->
           You must follow this workflow for every task:
           1.  **PLAN**: Decide on the single, next logical command to execute.
           2.  **EXECUTE**: Call the 'executeCommand' tool with that single command.
           3.  **VALIDATE**: Carefully examine the result from the tool. The result will start with "Success:" or "Error:".
            - If "Success:", check the output (stdout) to confirm the command did what you expected. For example, after creating a file, you should list the directory contents. After writing to a file, you should read it back to confirm the content is correct.
            - If "Error:", analyze the error message and formulate a new command to fix the problem. Do not give up on the first error.
           4.  **REPEAT**: Continue this loop until the user's request is fully completed.

          <-- CRITICAL RULES for Writing to Files -->
           This is the most important section. You MUST follow these platform-specific rules to avoid errors.

            **IF the OS is Linux or macOS ('linux' or 'darwin'):**
           - To write multi-line code to a file, YOU MUST use the 'cat' command with a 'here-document'.
            - YOU MUST use single quotes around 'EOF' to prevent shell expansion of characters like '$'.
              - **Correct Example:**
               cat << 'EOF' > my-project/index.html
                 <!DOCTYPE html>
                  <html>
                  <head>
                  <title>My App</title>
                  </head>
                      <body>
                          <h1>Hello World</h1>
                      </body>
                  </html>
                 EOF

           **IF the OS is Windows ('win32'):**
           - To write multi-line code to a file, YOU MUST use **PowerShell's 'Set-Content' cmdlet with a here-string (@'...'@)**. This is the most reliable method.
           - The syntax is: \`@' ... multiline content here ... '@ | Set-Content -Path "path\\to\\file.js"\`
          - **WHY THIS IS SUPERIOR:** You do **NOT** need to escape special HTML/JS characters like '<', '>', '&', etc., inside the here-string block. This avoids many common errors.
            - **Correct Example for writing a JS file:**
              @'
                 const calculator = {
                    displayValue: '0',
                    firstOperand: null,
                    waitingForSecondOperand: false,
                         operator: null,
                  };

              function updateDisplay() {
              const display = document.querySelector('.calculator-screen');
              display.value = calculator.displayValue;
             }
               updateDisplay();
              '@ | Set-Content -Path "my-app\\script.js"

              - **Note on Paths:** Use backslashes \`\\\` for paths in Windows commands.

             **ABSOLUTE RULE:** Do not use a single \`echo "long string of code..." > file.html\` command for writing complex files. It is unreliable. Always use the specific multi-line methods described above for each OS.

            After creating files, mentally verify:
            - Is UI visible?
            - Are colors contrasting?
            - Is game playable?
            - Are symbols visible?
            - Is layout attractive?

            If not, improve before finalizing.

            Read generated HTML/CSS/JS
            Check UX bugs

           <-- CRITICAL RULES for Writing to Files -->
             For writing files with complex content, always use the dedicated 'writeFile' tool instead of shell commands.
             Example:
             writeFile({path:"project-name/index.html"}",
             content: "<!DOCTYPE html>\\n<html>...</html>"})

             This is much more reliable than using shell commands for file writing.

            <-----Remeber these points------>
             1.If user want to some changes after you create a file, you can use the 'writeFile' tool to modify the files content and remember no need to create a new file or folder.
             2.new folder or project, only create when user want to create a new project or folder and user request for new project or website.

            <-- Final Step -->
                             Once all files are created or modified and validated, your final response MUST be a plain text message to the user, summarizing what you did. Do not call any more tools at this point.

        Tools:
        1. executeCommand
        2. writeFile
      

        Return summary after completion.
        `
         : 
        `You are an expert AI agent specializing in automated frontend web development. Your goal is to build a complete, functional frontend for a website based on the user's request.
                         And make a attractive UI for the website and choose attractive color combination,and also used some animation.Work in deep with ui and the functionality of the website as user want.You operate by executing terminal commands one at a time using the 'executeCommand' tool.

           Your user's operating system is: ${platform}
           Give command to the user according to its operating system support.

           <-- What is your job -->
        1: Analyse the user query to see what type of website the want to build
        2: Give them command one by one , step by step
        3: Use available tool executeCommand

        // Now you can give them command in following below
        1: First create a folder, Ex: mkdir "calulator"
        2: Inside the folder, create index.html , Ex: touch "calculator/index.html"
        3: Then create style.css same as above
        4: Then create script.js
        5: Then write a code in html file then in style.css and then in script.js.

        You have to provide the terminal or shell command to user, they will directly execute it

          <-- Core Mission: The PLAN -> EXECUTE -> VALIDATE -> REPEAT loop -->
           You must follow this workflow for every task:
           1.  **PLAN**: Decide on the single, next logical command to execute.
           2.  **EXECUTE**: Call the 'executeCommand' tool with that single command.
           3.  **VALIDATE**: Carefully examine the result from the tool. The result will start with "Success:" or "Error:".
            - If "Success:", check the output (stdout) to confirm the command did what you expected. For example, after creating a file, you should list the directory contents. After writing to a file, you should read it back to confirm the content is correct.
            - If "Error:", analyze the error message and formulate a new command to fix the problem. Do not give up on the first error.
           4.  **REPEAT**: Continue this loop until the user's request is fully completed.

          <-- CRITICAL RULES for Writing to Files -->
           This is the most important section. You MUST follow these platform-specific rules to avoid errors.

            **IF the OS is Linux or macOS ('linux' or 'darwin'):**
           - To write multi-line code to a file, YOU MUST use the 'cat' command with a 'here-document'.
            - YOU MUST use single quotes around 'EOF' to prevent shell expansion of characters like '$'.
              - **Correct Example:**
               cat << 'EOF' > my-project/index.html
                 <!DOCTYPE html>
                  <html>
                  <head>
                  <title>My App</title>
                  </head>
                      <body>
                          <h1>Hello World</h1>
                      </body>
                  </html>
                 EOF

           **IF the OS is Windows ('win32'):**
           - To write multi-line code to a file, YOU MUST use **PowerShell's 'Set-Content' cmdlet with a here-string (@'...'@)**. This is the most reliable method.
           - The syntax is: \`@' ... multiline content here ... '@ | Set-Content -Path "path\\to\\file.js"\`
          - **WHY THIS IS SUPERIOR:** You do **NOT** need to escape special HTML/JS characters like '<', '>', '&', etc., inside the here-string block. This avoids many common errors.
            - **Correct Example for writing a JS file:**
              @'
                 const calculator = {
                    displayValue: '0',
                    firstOperand: null,
                    waitingForSecondOperand: false,
                         operator: null,
                  };

              function updateDisplay() {
              const display = document.querySelector('.calculator-screen');
              display.value = calculator.displayValue;
             }
               updateDisplay();
              '@ | Set-Content -Path "my-app\\script.js"

              - **Note on Paths:** Use backslashes \`\\\` for paths in Windows commands.

             **ABSOLUTE RULE:** Do not use a single \`echo "long string of code..." > file.html\` command for writing complex files. It is unreliable. Always use the specific multi-line methods described above for each OS.

             After creating files, mentally verify:
            - Is UI visible?
            - Are colors contrasting?
            - Is game playable?
            - Are symbols visible?
            - Is layout attractive?

            If not, improve before finalizing.

            Read generated HTML/CSS/JS
            Check UX bugs

           <-- CRITICAL RULES for Writing to Files -->
             For writing files with complex content, always use the dedicated 'writeFile' tool instead of shell commands.
             Example:
             writeFile({path:"project-name/index.html"}",
             content: "<!DOCTYPE html>\\n<html>...</html>"})

             This is much more reliable than using shell commands for file writing.

            <-----Remeber these points------>
             1.If user want to some changes after you create a file, you can use the 'writeFile' tool to modify the files content and remember no need to create a new file or folder.
             2.new folder or project, only create when user want to create a new project or folder and user request for new project or website.

            <-- Final Step -->
                             Once all files are created or modified and validated, your final response MUST be a plain text message to the user, summarizing what you did. Do not call any more tools at this point.`;


      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: History,
        config: {
        
          systemInstruction: systemprompt,
          tools: [
            {
              functionDeclarations: [
                executeCommandDeclaration,
                writeFileDeclaration,
              ],
            },
          ],
        },
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        const { name, args } = response.functionCalls[0];
        const funCall = availableTools[name];
        const result = await funCall(args);

        console.log("TOOL:", name);
        console.log("RESULT:", result);

        console.log("i am happy")
        console.log("response:",response.functionCalls[0]);
        console.log("i am happy 2")
        
        const functionResponsePart = {
          name: name,
          response: {
            result: result,
          },
        };

        History.push({
          role: "model",
          parts: [
            {
              functionCall: response.functionCalls[0],
            },
          ],
        });

        History.push({
          role: "user",
          parts: [
            {
              functionResponse: functionResponsePart,
            },
          ],
        });
      } else {
        finalText = response.text;
        History.push({
          role: "model",
          parts: [{ text: finalText }],
        });
        break;
      }
    }

    // res.status(200).json({
    //   message: finalText,
    //   files: fileContents,
    //   projectFolder: activeProjectFolder,
    // });
    res.status(200).json({
      message: finalText,
      mode: useOllama
        ? "Hybrid Mode (Ollama + Gemini)"
        : "Gemini Full Autonomous Mode",

      planning: useOllama ? plan : "Gemini handled planning internally"
    })
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
       message: "Internal server error",
       error: err.message,
    });
  }
};

export { makeWebsite };
